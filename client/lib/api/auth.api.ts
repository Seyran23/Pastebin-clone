import { IAuthResponse } from '@/lib/types';

import api from './interceptor';

export const signupUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  return await api.post('/auth/signup', data);
};

export const loginUser = async (data: {
  username: string;
  password: string;
}): Promise<IAuthResponse> => {
  return await api.post('/auth/login', data);
};

export const refreshingTokens = async () => {
  return await api.get('/auth/refresh');
};

export const verifyEmail = async (activationLink: string): Promise<IAuthResponse> => {
  return await api.get(`/auth/verify-email/${activationLink}`);
};

export const forgotPassword = async (username: string): Promise<{ message: string }> => {
  return await api.post('/auth/forgot-password', { username });
};

export const forgotUsername = async (email: string): Promise<{ message: string }> => {
  return await api.post('/auth/forgot-username', { email });
};

export const resendActivation = async (username: string): Promise<{ message: string }> => {
  return await api.post('/auth/resend-activation', { username });
};
