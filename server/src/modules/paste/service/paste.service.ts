import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import {
  Comment,
  ExpirationTime,
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

import { PasteDto } from '../dto';
import {
  calculateRemainingTime,
  formatPasteContent,
  formatPasteResponse,
  formatPasteSummaries,
} from '../utils';
import { validateExpiration } from '../validator';

// ─── Lookup caches ────────────────────────────────────────────────────────────

export const getCategoriesService = async () => {
  const key = 'paste:categories';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as { id: number; category_name: string }[];
  const rows = await PasteCategory.findAll({ attributes: ['id', 'category_name'], raw: true });
  if (rows.length) await redisClient.set(key, JSON.stringify(rows));
  return rows;
};

export const getHighlightsService = async () => {
  const key = 'paste:syntax-highlights';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as { id: number; language: string }[];
  const rows = await SyntaxHighlights.findAll({ attributes: ['id', 'language'], raw: true });
  if (rows.length) await redisClient.set(key, JSON.stringify(rows));
  return rows;
};

export const getExpirationTimeService = async () => {
  const key = 'paste:expiration-time';
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as string[];
  const rows = await ExpirationTime.findAll({ attributes: ['label'], raw: true });
  const labels = rows.map((r) => r.label);
  if (labels.length) await redisClient.set(key, JSON.stringify(labels));
  return labels;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

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
    where,
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

// ─── Archive ──────────────────────────────────────────────────────────────────

export const getArchiveService = async (cursor?: string, limit = 20) => {
  const where: Record<string, unknown> = {
    exposure: 'public',
    password: null,
    expired: false,
  };

  if (cursor) {
    where.createdAt = { [Op.lt]: new Date(cursor) };
  }

  const rows = await Paste.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['username'] },
      { model: PasteCategory, as: 'category', attributes: ['category_name'] },
      { model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['language'] },
    ],
    attributes: ['id', 'name', 'link_endpoint', 'size', 'createdAt', 'expiration_time'],
    order: [['createdAt', 'DESC']],
    limit: limit + 1,
  });

  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);

  return {
    data: data.map((p) => ({
      id: p.id,
      name: p.name,
      link: p.link_endpoint,
      size: p.size,
      createdAt: p.createdAt,
      expiresAt: p.expiration_time,
      author: p.user?.username ?? null,
      category: p.category?.category_name ?? null,
      syntax: p.syntaxHighlight?.language ?? null,
    })),
    pagination: {
      hasNextPage: hasMore,
      nextCursor: hasMore ? (data[data.length - 1]?.createdAt.toISOString() ?? null) : null,
    },
  };
};

// ─── Write ────────────────────────────────────────────────────────────────────

export const unlockPasteService = async (link: string, inputPassword: string) => {
  const paste = await Paste.findOne({
    where: { link_endpoint: link },
    include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
  });

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!paste.password) throw new AppError(403, 'Paste is not password-protected');

  const isCorrect = await bcrypt.compare(inputPassword, paste.password);
  if (!isCorrect) throw new AppError(403, 'Invalid password');

  const content = await processPasteContentService(paste);
  return { content, paste };
};

export const createPasteService = async (pasteData: PasteCreationAttributes) => {
  const newPaste = await Paste.create(pasteData);
  return new PasteDto(newPaste);
};

export const updatePasteByLinkService = async (
  link: string,
  updateData: Record<string, unknown>,
  requestingUserId: string,
) => {
  const paste = await Paste.findOne({ where: { link_endpoint: link } });
  if (!paste) throw new AppError(404, 'Paste not found');
  if (paste.createdBy !== requestingUserId) throw new AppError(403, 'Forbidden');

  if ('name' in updateData && updateData.name !== undefined) paste.name = updateData.name as string;
  if ('exposure' in updateData && updateData.exposure !== undefined)
    paste.exposure = updateData.exposure as 'public' | 'private' | 'unlisted';
  if ('password' in updateData) {
    paste.password = updateData.password
      ? await bcrypt.hash(updateData.password as string, 12)
      : null;
  }
  await paste.save();
  return paste;
};

export const deletePasteService = async (pasteId: string, requestingUserId: string) => {
  const paste = await Paste.findByPk(pasteId);
  if (!paste) throw new AppError(404, 'Paste not found');
  if (paste.createdBy !== requestingUserId) throw new AppError(403, 'Forbidden');

  await deleteFileFromS3(paste.cloud_name);
  await paste.destroy();
  return { message: 'Paste was deleted successfully!' };
};

