import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import {
  Comment,
  ExpirationTime,
  LikeStats,
  Paste,
  PasteCategory,
  sequelize,
  SyntaxHighlights,
  User,
} from '@/db/models';
import type { PasteCreationAttributes } from '@/db/models/paste';
import { AppError } from '@/middlewares/error-handler';
import { deleteFileFromS3 } from '@/modules/cloud/service';
import redisClient from '@/utils/redis';

import { PasteDto } from './dto';
import {
  buildOrder,
  calculateRemainingTime,
  formatPasteContent,
  formatPasteResponse,
  formatPasteSummaries,
  parseTimeFilter,
} from './utils';
import { validateExpiration } from './validator';

// ─── Lookup caches ───────────────────────────────────────────────────────────

export const getCategoriesService = async () => {
  const key = 'paste:categories';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as { id: number; category_name: string }[];
  const rows = await PasteCategory.findAll({ attributes: ['id', 'category_name'], raw: true });
  await redisClient.set(key, JSON.stringify(rows));
  return rows;
};

export const getHighlightsService = async () => {
  const key = 'paste:syntax-highlights';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as { id: number; language: string }[];
  const rows = await SyntaxHighlights.findAll({ attributes: ['id', 'language'], raw: true });
  await redisClient.set(key, JSON.stringify(rows));
  return rows;
};

export const getExpirationTimeService = async () => {
  const key = 'paste:expiration-time';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as string[];
  const rows = await ExpirationTime.findAll({ attributes: ['label'], raw: true });
  const labels = rows.map((r) => r.label);
  await redisClient.set(key, JSON.stringify(labels));
  return labels;
};

// ─── Paste read ───────────────────────────────────────────────────────────────

export const getPasteMetadataService = async (link: string) => {
  const paste = await Paste.findOne({
    where: { link_endpoint: link },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
      { model: PasteCategory, as: 'category', attributes: ['id', 'category_name'] },
      { model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['id', 'language'] },
    ],
  });

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!paste.user) throw new AppError(500, 'Paste owner not found');

  return {
    paste,
    requiresPassword: !!paste.password,
    owner: paste.user,
    exposure: paste.exposure,
    expiration: paste.expiration_time,
  };
};

export const processPasteContentService = async (paste: Paste) => {
  validateExpiration(paste.expiration_time);
  const fileData = await formatPasteContent(paste);
  const remainingTime = calculateRemainingTime(paste.expiration_time);
  return formatPasteResponse(paste, fileData, remainingTime);
};

export const getProfilePastesService = async (username: string, requestingUser?: string) => {
  const user = await User.findOne({ where: { username }, attributes: ['id'] });
  if (!user) throw new AppError(404, 'User not found');

  const isOwner = username === requestingUser;

  const pastes = await Paste.findAll({
    where: {
      createdBy: user.id,
      ...(!isOwner && { exposure: 'public', password: null }),
    },
    include: [
      { model: Comment, attributes: [], required: false, as: 'comments' },
      { model: SyntaxHighlights, attributes: ['language'], as: 'syntaxHighlight' },
    ],
    attributes: [
      'id',
      'name',
      'link_endpoint',
      'exposure',
      'createdAt',
      'expiration_time',
      [sequelize.fn('COUNT', sequelize.col('comments.id')), 'commentsCount'],
    ],
    group: ['Paste.id', 'syntaxHighlight.id'],
    order: [['createdAt', 'DESC']],
  });

  return pastes.map((paste) => ({
    id: paste.id,
    name: paste.name,
    link: paste.link_endpoint,
    exposure: paste.exposure,
    added: paste.createdAt,
    expires: paste.expiration_time,
    comments: paste.get('commentsCount'),
    syntax: paste.syntaxHighlight?.language,
  }));
};

// ─── Paste write ──────────────────────────────────────────────────────────────

export const unlockPasteService = async (link: string, inputPassword: string) => {
  const paste = await Paste.findOne({
    where: { link_endpoint: link },
    include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
  });

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!paste.password) throw new AppError(403, 'Paste is not password-protected');

  const isCorrect = await bcrypt.compare(inputPassword, paste.password);
  if (!isCorrect) throw new AppError(403, 'Invalid password');

  return processPasteContentService(paste);
};

export const createPasteService = async (pasteData: PasteCreationAttributes) => {
  const newPaste = await Paste.create(pasteData);
  return new PasteDto(newPaste);
};

export const updatePasteByLinkService = async (
  link: string,
  updateData: Record<string, unknown>,
) => {
  const paste = await Paste.findOne({ where: { link_endpoint: link } });
  if (!paste) return null;

  const allowed = ['name', 'exposure', 'password'] as const;
  for (const key of allowed) {
    if (key in updateData && updateData[key] !== undefined) {
      (paste as unknown as Record<string, unknown>)[key] = updateData[key];
    }
  }
  await paste.save();
  return paste;
};

export const deletePasteService = async (pasteId: string) => {
  const paste = await Paste.findByPk(pasteId);
  if (!paste) throw new AppError(404, 'Paste not found');

  await deleteFileFromS3(paste.cloud_name);
  await paste.destroy();
  return { message: 'Paste was deleted successfully!' };
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchPastesService = async (query: Record<string, string>) => {
  const {
    searchTerm = '',
    category = '',
    sort = 'newest',
    time = 'all',
    cursor,
    limit = '10',
    direction = 'next',
  } = query;

  const order = buildOrder(sort) as [[string, string]];
  const [orderField, defaultDir] = order[0];
  const isDesc = defaultDir.toUpperCase() === 'DESC';
  const useDesc = direction === 'next' ? isDesc : !isDesc;

  const where: Record<string, unknown> = {
    exposure: 'public',
    password: null,
    name: { [Op.iLike]: `%${searchTerm}%` },
  };

  if (category) where.category_id = category;

  const timeFilter = parseTimeFilter(time);
  if (timeFilter) where.createdAt = { [Op.gte]: timeFilter };

  if (cursor) {
    const cursorDate = new Date(cursor);
    where[orderField] = {
      ...(where[orderField] ?? {}),
      [useDesc ? Op.lt : Op.gt]: cursorDate,
    };
  }

  const results = await Paste.findAll({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    where: where as any,
    include: [
      { model: User, as: 'user', attributes: ['username', 'avatar', 'id'] },
      { model: PasteCategory, as: 'category', attributes: ['id', 'category_name'] },
      { model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['id', 'language'] },
    ],
    attributes: [
      'id',
      'name',
      'link_endpoint',
      'createdAt',
      'size',
      'expiration_time',
      'cloud_name',
    ],
    order: [[orderField, useDesc ? 'DESC' : 'ASC']],
    limit: Number(limit) + 1,
  });

  const hasMore = results.length > Number(limit);
  const sliced = results.slice(0, Number(limit));
  const finalData = direction === 'prev' ? sliced.reverse() : sliced;

  const enrichedData = await Promise.all(
    finalData.map(async (paste) => {
      const [processed, stats] = await Promise.all([
        processPasteContentService(paste),
        getLikeStatsService(paste.id),
      ]);

      return {
        id: paste.id,
        name: paste.name,
        link: paste.link_endpoint,
        size: paste.size,
        createdAt: paste.createdAt,
        expiresAt: paste.expiration_time,
        category: paste.category?.category_name,
        syntaxHighlight: paste.syntaxHighlight?.language,
        author: paste.user?.username,
        content: processed.pasteData.content,
        contentType: processed.pasteData.contentType,
        remainingTime: processed.remainingTime,
        starCount: stats.likes + stats.dislikes,
      };
    }),
  );

  return {
    data: enrichedData,
    pagination: {
      hasNextPage: direction === 'next' ? hasMore : Boolean(cursor),
      hasPrevPage: direction === 'prev' ? hasMore : Boolean(cursor),
      nextCursor: hasMore
        ? (finalData[finalData.length - 1] as unknown as Record<string, unknown>)[orderField]
        : null,
      prevCursor:
        finalData.length > 0
          ? (finalData[0] as unknown as Record<string, unknown>)[orderField]
          : null,
      itemsPerPage: Number(limit),
    },
  };
};

export const searchMyPastesService = async (userId: string, title: string) => {
  const pastes = await Paste.findAll({
    where: { createdBy: userId, name: { [Op.iLike]: `%${title}%` } },
    include: [
      { model: Comment, attributes: [], required: false, as: 'comments' },
      { model: SyntaxHighlights, attributes: ['language'], as: 'syntaxHighlight' },
    ],
    attributes: [
      'id',
      'name',
      'link_endpoint',
      'createdAt',
      'expiration_time',
      [sequelize.fn('COUNT', sequelize.col('comments.id')), 'commentsCount'],
    ],
    group: ['Paste.id', 'syntaxHighlight.id'],
    order: [['createdAt', 'DESC']],
  });

  return pastes.map((paste) => ({
    id: paste.id,
    name: paste.name,
    link: paste.link_endpoint,
    addedAt: paste.createdAt,
    expires: paste.expiration_time,
    comments: Number(paste.get('commentsCount')),
    syntax: paste.syntaxHighlight?.language,
  }));
};

export const getUserPasteSummariesService = async (userId: string) => {
  if (!userId) throw new AppError(403, 'Authentication required');

  const pastes = await Paste.findAll({
    where: { createdBy: userId },
    include: [{ model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['id', 'language'] }],
    attributes: ['id', 'name', 'createdAt', 'cloud_name', 'exposure', 'size'],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  return formatPasteSummaries(pastes);
};

export const getPublicPasteSummariesService = async (excludeUserId?: string) => {
  const where: Record<string, unknown> = { exposure: 'public', password: null };
  if (excludeUserId) where.createdBy = { [Op.ne]: excludeUserId };

  const pastes = await Paste.findAll({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    where: where as any,
    include: [
      { model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['id', 'language'] },
      { model: PasteCategory, as: 'category', attributes: ['id', 'category_name'] },
    ],
    attributes: ['id', 'name', 'createdAt', 'cloud_name', 'exposure', 'size', 'link_endpoint'],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  return formatPasteSummaries(pastes);
};

// ─── Likes ────────────────────────────────────────────────────────────────────

export const toggleLikeService = async (username: string, pasteId: string, isLike: boolean) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!user) throw new AppError(404, 'User not found');

  const existing = await LikeStats.findOne({ where: { user_id: user.id, paste_id: pasteId } });

  if (existing) {
    await existing.update({ is_liked: isLike });
  } else {
    await LikeStats.create({ user_id: user.id, paste_id: pasteId, is_liked: isLike });
  }

  return {
    message: `You have ${isLike ? 'liked' : 'disliked'} the paste`,
    likedStatus: isLike,
  };
};

export const getLikeStatsService = async (pasteId: string) => {
  const [likes, dislikes] = await Promise.all([
    LikeStats.count({ where: { paste_id: pasteId, is_liked: true } }),
    LikeStats.count({ where: { paste_id: pasteId, is_liked: false } }),
  ]);
  return { likes, dislikes };
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const createCommentService = async (content: string, pasteId: string, username: string) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!user) throw new AppError(404, 'User not found');

  return Comment.create({ content, paste_id: pasteId, user_id: user.id });
};

export const deleteCommentService = async (commentId: string) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new AppError(404, 'Comment not found');
  await comment.destroy();
  return { message: 'Comment was deleted successfully!' };
};
