import { col, fn, literal, Op } from 'sequelize';

import {
  Comment,
  LikeStats,
  Paste,
  PasteCategory,
  sequelize,
  SyntaxHighlights,
  User,
} from '@/db/models';

import { buildOrder, calculateRemainingTime, parseTimeFilter } from '../utils';

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
    [Op.or]: [
      { name: { [Op.iLike]: `%${searchTerm}%` } },
      { preview: { [Op.iLike]: `%${searchTerm}%` } },
    ],
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
    where,
    include: [
      { model: User, as: 'user', attributes: ['username', 'avatar', 'id'] },
      { model: PasteCategory, as: 'category', attributes: ['id', 'category_name'] },
      { model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['id', 'language'] },
    ],
    attributes: [
      'id', 'name', 'link_endpoint', 'createdAt', 'size',
      'expiration_time', 'preview', 'view_count',
    ],
    order: [[orderField, useDesc ? 'DESC' : 'ASC']],
    limit: Number(limit) + 1,
  });

  const hasMore = results.length > Number(limit);
  const sliced = results.slice(0, Number(limit));
  const finalData = direction === 'prev' ? sliced.reverse() : sliced;

  const pasteIds = finalData.map((p) => p.id);

  const [likeRows, commentRows] = await Promise.all([
    LikeStats.findAll({
      where: { paste_id: { [Op.in]: pasteIds } },
      attributes: [
        'paste_id',
        [fn('SUM', literal(`CASE WHEN is_liked = true THEN 1 ELSE 0 END`)), 'likes'],
        [fn('SUM', literal(`CASE WHEN is_liked = false THEN 1 ELSE 0 END`)), 'dislikes'],
      ],
      group: ['paste_id'],
      raw: true,
    }),
    Comment.findAll({
      where: { paste_id: { [Op.in]: pasteIds } },
      attributes: ['paste_id', [fn('COUNT', col('id')), 'count']],
      group: ['paste_id'],
      raw: true,
    }),
  ]);

  const likesMap = new Map(
    (likeRows as unknown as { paste_id: string; likes: string; dislikes: string }[]).map(
      (r) => [r.paste_id, { likes: Number(r.likes), dislikes: Number(r.dislikes) }],
    ),
  );
  const commentsMap = new Map(
    (commentRows as unknown as { paste_id: string; count: string }[]).map((r) => [
      r.paste_id,
      Number(r.count),
    ]),
  );

  const enrichedData = finalData.map((paste) => {
    const stats = likesMap.get(paste.id) ?? { likes: 0, dislikes: 0 };
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
      preview: paste.preview,
      remainingTime: calculateRemainingTime(paste.expiration_time),
      likes: stats.likes,
      viewCount: paste.view_count,
      commentsCount: commentsMap.get(paste.id) ?? 0,
    };
  });

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
