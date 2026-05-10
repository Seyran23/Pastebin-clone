import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
  JWT_RESET_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
} from '../utils/env';
import { Token } from '../db/models';
import type { AuthUser } from '../types/express';

type TokenPayload = AuthUser;

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload as object, JWT_ACCESS_TOKEN, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign(payload as object, JWT_REFRESH_TOKEN, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  });
  return { accessToken, refreshToken };
};

export const saveToken = async (userId: string, refreshToken: string) => {
  const tokenData = await Token.findOne({ where: { user_id: userId } });
  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    return tokenData.save();
  }
  return Token.create({ user_id: userId, refreshToken });
};

export const removeToken = async (refreshToken: string) => {
  return Token.destroy({ where: { refreshToken } });
};

export const validateAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_ACCESS_TOKEN) as TokenPayload;
  } catch {
    return null;
  }
};

export const validateRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_TOKEN) as TokenPayload;
  } catch {
    return null;
  }
};

export const findToken = async (refreshToken: string) => {
  return Token.findOne({ where: { refreshToken } });
};

export const resetPasswordToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, JWT_RESET_TOKEN, { expiresIn: '10m' });
};
