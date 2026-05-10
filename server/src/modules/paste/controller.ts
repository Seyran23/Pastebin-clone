import type { Request, Response, NextFunction } from 'express';
import { User, ExpirationTime } from '../../db/models';
import {
  getCategoriesService, getHighlightsService, getExpirationTimeService,
  toggleLikeService, getLikeStatsService, createCommentService,
  createPasteService, deletePasteService, deleteCommentService,
  unlockPasteService, getPasteMetadataService, processPasteContentService,
  getUserPasteSummariesService, getPublicPasteSummariesService,
  searchPastesService, searchMyPastesService, getProfilePastesService,
  updatePasteByLinkService,
} from './service';
import hashingPassword from '../../utils/passwordHashing';
import randomFileName from '../../utils/randomFileName';
import { uploadFileToS3 } from '../cloud/service';
import { getLinksFromCache, removeLinkFromCache } from './paste-link.service';
import { AppError } from '../../middlewares/error-handler';
import attachAvatarImage from '../../utils/attachAvatar';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getCategoriesService());
  } catch (err) { next(err); }
};

export const getSyntaxHighlights = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getHighlightsService());
  } catch (err) { next(err); }
};

export const getExpirationTime = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getExpirationTimeService());
  } catch (err) { next(err); }
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

    const content = await processPasteContentService(paste);

    // Attach avatar to owner object in-place
    if (content.owner) {
      await attachAvatarImage(content.owner, content.owner as unknown as Record<string, unknown>);
    }

    const stats = await getLikeStatsService(paste.id);
    content.pasteData = { ...content.pasteData, ...stats };

    // Bug fix: removed dangling `await` that caused TypeError
    res.status(200).json({ ...content, requiresPassword: false });
  } catch (err) { next(err); }
};

export const getProfilePastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params as { username: string };
    const requestingUser = req.user?.username;
    res.status(200).json(await getProfilePastesService(username, requestingUser));
  } catch (err) { next(err); }
};

export const unlockPaste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link, password } = req.body as { link: string; password: string };
    res.status(200).json(await unlockPasteService(link, password));
  } catch (err) { next(err); }
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
    const { username } = req.user!;

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
    });

    await removeLinkFromCache();
    res.status(200).json(newPaste);
  } catch (err) { next(err); }
};

export const deletePaste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await deletePasteService(String(req.params['id'])));
  } catch (err) { next(err); }
};

export const searchPastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await searchPastesService(req.query as Record<string, string>));
  } catch (err) { next(err); }
};

export const searchMyPastes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title = '' } = req.query as { title?: string };
    res.status(200).json(await searchMyPastesService(req.user!.id, title));
  } catch (err) { next(err); }
};

export const getPasteSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query as { type?: string };
    const userId = req.user?.id;

    let result;
    if (type === 'mine') {
      result = await getUserPasteSummariesService(userId!);
    } else if (type === 'public') {
      result = await getPublicPasteSummariesService(userId);
    } else {
      throw new AppError(400, 'Invalid type provided');
    }

    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const updatePasteByLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link } = req.params as { link: string };
    const updated = await updatePasteByLinkService(link, req.body as Record<string, unknown>);
    if (!updated) throw new AppError(404, 'Paste not found');
    res.status(200).json({ message: 'Paste updated successfully', paste: updated });
  } catch (err) { next(err); }
};

export const togglePasteLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { isLike } = req.body as { isLike: boolean };
    res.status(200).json(await toggleLikeService(req.user!.username, id, isLike));
  } catch (err) { next(err); }
};

export const getLikeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getLikeStatsService(String(req.params['id'])));
  } catch (err) { next(err); }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body as { content: string };
    const { id } = req.params as { id: string };
    res.status(200).json(await createCommentService(content, id, req.user!.username));
  } catch (err) { next(err); }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await deleteCommentService(String(req.params['id'])));
  } catch (err) { next(err); }
};
