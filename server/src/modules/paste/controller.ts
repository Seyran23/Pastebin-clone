import type { NextFunction, Request, Response } from 'express';

import { ExpirationTime, User } from '@/db/models';
import { AppError } from '@/middlewares/error-handler';
import { uploadFileToS3 } from '@/modules/cloud/service';
import attachAvatarImage from '@/utils/attachAvatar';
import { getAuthUser } from '@/utils/getAuthUser';
import hashingPassword from '@/utils/passwordHashing';
import randomFileName from '@/utils/randomFileName';

import { getLinksFromCache, removeLinkFromCache } from './paste-link.service';
import {
  createCommentService,
  createPasteService,
  deleteCommentService,
  getCommentsService,
  deletePasteService,
  getArchiveService,
  getCategoriesService,
  getExpirationTimeService,
  getHighlightsService,
  getLikeStatsService,
  getPasteMetadataService,
  getProfilePastesService,
  getPublicPasteSummariesService,
  getUserPasteSummariesService,
  processPasteContentService,
  searchMyPastesService,
  searchPastesService,
  toggleLikeService,
  unlockPasteService,
  updatePasteByLinkService,
  getUserCommentsService,
} from './service';

export const getArchive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cursor, limit } = req.query as { cursor?: string; limit?: string };
    res.status(200).json(await getArchiveService(cursor, limit ? Number(limit) : undefined));
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getCategoriesService());
  } catch (err) {
    next(err);
  }
};

export const getSyntaxHighlights = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getHighlightsService());
  } catch (err) {
    next(err);
  }
};

export const getExpirationTime = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getExpirationTimeService());
  } catch (err) {
    next(err);
  }
};

export const getPasteByLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link } = req.params as { link: string };
    const requestingUser = req.user?.username;

    const { paste, requiresPassword, owner, exposure } = await getPasteMetadataService(link);
    const isOwner = owner.username === requestingUser;

    // Private pastes: only owner can access
    if (exposure === 'private' && !isOwner) {
      throw new AppError(403, 'This paste is private. Please login to view it.');
    }

    // Password-protected: non-owners must unlock
    if (requiresPassword && !isOwner) {
      res.status(200).json({ requiresPassword: true });
      return;
    }

    const [content] = await Promise.all([
      processPasteContentService(paste),
      paste.increment('view_count'),
    ]);

    if (content.owner) {
      await attachAvatarImage(content.owner, content.owner as unknown as Record<string, unknown>);
    }

    const stats = await getLikeStatsService(paste.id, req.user?.id);
    content.pasteData = { ...content.pasteData, ...stats };

    res.status(200).json({ ...content, requiresPassword: false, viewCount: paste.view_count + 1 });
  } catch (err) {
    next(err);
  }
};

export const getProfilePastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params as { username: string };
    const requestingUser = req.user?.username;
    res.status(200).json(await getProfilePastesService(username, requestingUser));
  } catch (err) {
    next(err);
  }
};

export const unlockPaste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link, password } = req.body as { link: string; password: string };
    const { content, paste } = await unlockPasteService(link, password);
    const [, stats] = await Promise.all([
      paste.increment('view_count'),
      getLikeStatsService(paste.id, req.user?.id),
    ]);
    content.pasteData = { ...content.pasteData, ...stats };
    res.status(200).json({ ...content, viewCount: paste.view_count + 1 });
  } catch (err) {
    next(err);
  }
};

export const createPaste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      content,
      category,
      syntaxHighlight,
      exposure,
      expirationTime: selectedExpiration,
      name,
    } = req.body as {
      content: string;
      category?: number;
      syntaxHighlight?: number;
      exposure: 'public' | 'private' | 'unlisted';
      expirationTime: string;
      name: string;
    };

    let { password } = req.body as { password?: string };
    const { username } = getAuthUser(req);

    const randomName = randomFileName('text');
    await uploadFileToS3(randomName, content, 'text/plain');

    const user = await User.findOne({ attributes: ['id'], where: { username } });
    if (!user) throw new AppError(404, 'User not found!');

    if (password) {
      password = await hashingPassword(password);
    } else {
      password = undefined;
    }

    const endpointLink = await getLinksFromCache();

    let expirationDate: number | null = null;
    if (selectedExpiration !== 'never') {
      const exp = await ExpirationTime.findOne({ where: { label: selectedExpiration } });
      if (!exp) throw new AppError(404, 'Expiration time not found!');
      expirationDate = Date.now() + Number(exp.duration);
    }

    const size = Buffer.byteLength(content, 'utf-8');
    const preview = content.slice(0, 300);

    const newPaste = await createPasteService({
      createdBy: user.id,
      category_id: category ?? null,
      syntax_highlight_id: syntaxHighlight ?? null,
      exposure,
      password: password ?? null,
      name,
      link_endpoint: endpointLink,
      cloud_name: randomName,
      expiration_time: expirationDate,
      size,
      preview,
    });

    await removeLinkFromCache();
    res.status(200).json(newPaste);
  } catch (err) {
    next(err);
  }
};

export const deletePaste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = getAuthUser(req);
    res.status(200).json(await deletePasteService(String(req.params.id), id));
  } catch (err) {
    next(err);
  }
};

export const searchPastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await searchPastesService(req.query as Record<string, string>));
  } catch (err) {
    next(err);
  }
};

export const searchMyPastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title = '' } = req.query as { title?: string };
    const { id } = getAuthUser(req);
    res.status(200).json(await searchMyPastesService(id, title));
  } catch (err) {
    next(err);
  }
};

export const getPasteSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query as { type?: string };
    const userId = req.user?.id;

    let result;
    if (type === 'mine') {
      result = await getUserPasteSummariesService(getAuthUser(req).id);
    } else if (type === 'public') {
      result = await getPublicPasteSummariesService(userId);
    } else {
      throw new AppError(400, 'Invalid type provided');
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updatePasteByLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link } = req.params as { link: string };
    const { id } = getAuthUser(req);
    const updated = await updatePasteByLinkService(link, req.body as Record<string, unknown>, id);
    res.status(200).json({ message: 'Paste updated successfully', paste: updated });
  } catch (err) {
    next(err);
  }
};

export const togglePasteLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { isLike } = req.body as { isLike: boolean };
    const { username } = getAuthUser(req);
    res.status(200).json(await toggleLikeService(username, id, isLike));
  } catch (err) {
    next(err);
  }
};

export const getLikeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getLikeStatsService(String(req.params.id)));
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    res.status(200).json(await getCommentsService(id));
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body as { content: string };
    const { id } = req.params as { id: string };
    const { username } = getAuthUser(req);
    res.status(200).json(await createCommentService(content, id, username));
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = getAuthUser(req);
    res.status(200).json(await deleteCommentService(String(req.params.id), id));
  } catch (err) {
    next(err);
  }
};

export const getUserComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getUserCommentsService(String(req.params.username)));
  } catch (err) {
    next(err);
  }
};
