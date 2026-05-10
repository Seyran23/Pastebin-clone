import type { Request, Response, NextFunction } from 'express';
import {
  getProfileService, userProfileUpdateService, getPasteStatsForUserService,
  changePasswordService, deleteUserService, avatarUpdateService,
} from './service';
import { UserDto } from './dto';
import attachAvatarImage from '../../utils/attachAvatar';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfileService(String(req.params['username']));
    const userDto = new UserDto(user);
    await attachAvatarImage(user, userDto as unknown as Record<string, unknown>);
    res.status(200).json({ ...userDto });
  } catch (err) { next(err); }
};

export const updateUserProfileDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.user!;
    const { email, location } = req.body as { email?: string; location?: string };
    const updated = await userProfileUpdateService(username, { email, location });
    res.status(200).json({ message: 'Profile updated successfully', user: { ...updated } });
  } catch (err) { next(err); }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.user!;
    const file = req.file as (Express.Multer.File & { key: string }) | undefined;
    if (!file) {
      res.status(422).json({ message: 'No file provided' });
      return;
    }
    res.status(200).json(await avatarUpdateService(username, file));
  } catch (err) { next(err); }
};

export const getPasteStatsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params as { username: string };
    res.status(200).json(await getPasteStatsForUserService(username, req.user?.id));
  } catch (err) { next(err); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.user!;
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    res.status(200).json(await changePasswordService(username, currentPassword, newPassword));
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Security: only allow users to delete their own account
    const requestingUsername = req.user!.username;
    const { username } = req.params as { username: string };
    if (requestingUsername !== username) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.status(200).json(await deleteUserService(username));
  } catch (err) { next(err); }
};
