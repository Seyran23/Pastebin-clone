import type { NextFunction, Request, Response } from 'express';

import attachAvatarImage from '@/utils/attachAvatar';
import { getAuthUser } from '@/utils/getAuthUser';

import { UserDto } from './dto';
import {
  avatarUpdateService,
  changePasswordService,
  deleteUserService,
  getPasteStatsForUserService,
  getProfileService,
  userProfileUpdateService,
} from './service';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfileService(String(req.params.username));
    const userDto = new UserDto(user);
    await attachAvatarImage(user, userDto as unknown as Record<string, unknown>);
    res.status(200).json({ ...userDto });
  } catch (err) {
    next(err);
  }
};

export const updateUserProfileDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = getAuthUser(req);
    const { email, location } = req.body as { email?: string; location?: string };
    const updated = await userProfileUpdateService(username, { email, location });
    res.status(200).json({ message: 'Profile updated successfully', user: { ...updated } });
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = getAuthUser(req);
    const file = req.file as (Express.Multer.File & { key: string }) | undefined;
    res.status(200).json(await avatarUpdateService(username, file));
  } catch (err) {
    next(err);
  }
};

export const getPasteStatsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params as { username: string };
    res.status(200).json(await getPasteStatsForUserService(username, req.user?.id));
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = getAuthUser(req);
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    res.status(200).json(await changePasswordService(username, currentPassword, newPassword));
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username: requestingUsername } = getAuthUser(req);
    const { username } = req.params as { username: string };
    if (requestingUsername !== username) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.status(200).json(await deleteUserService(username));
  } catch (err) {
    next(err);
  }
};
