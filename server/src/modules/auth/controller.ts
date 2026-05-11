import type { NextFunction, Request, Response } from 'express';

import { CLIENT_URL } from '@/utils/env';

import type { findOrCreateGoogleUser } from './google.service';
import {
  activateProfileService,
  forgotPasswordService,
  forgotUsernameService,
  loginService,
  logoutService,
  refreshService,
  resendActivationEmailService,
  resetPasswordService,
  signupService,
} from './service';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };
    const result = await signupService(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const result = await loginService(username, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await logoutService(refreshToken);
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await refreshService(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const activateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activationLink } = req.params as { activationLink: string };
    const requestingUserId = req.user?.id;
    if (!requestingUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await activateProfileService(activationLink, requestingUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body as { username: string };
    res.status(200).json(await forgotPasswordService(username));
  } catch (err) {
    next(err);
  }
};

export const forgotUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    res.status(200).json(await forgotUsernameService(email));
  } catch (err) {
    next(err);
  }
};

export const resendActivationLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email } = req.body as { username: string; email: string };
    res.status(200).json(await resendActivationEmailService(username, email));
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    res.status(200).json(await resetPasswordService(token, newPassword));
  } catch (err) {
    next(err);
  }
};

export const googleCallback = (req: Request, res: Response) => {
  const result = req.user as unknown as Awaited<ReturnType<typeof findOrCreateGoogleUser>>;
  const params = new URLSearchParams({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  res.redirect(`${CLIENT_URL}/oauth/callback?${params.toString()}`);
};
