import { IUserInfo, IUserPaste, IUserPastesStats, IUserProfile } from '@/lib/types';

import api from './interceptor';

export const getUserProfile = async (username: string): Promise<IUserProfile> => {
  return await api.get(`/users/profile/${username}`);
};

export const updateProfile = async (data: {
  email: string;
  location: string;
}): Promise<{ message: string; user: IUserInfo }> => {
  return await api.patch('/users/edit/profile-details', data);
};

export const updateAvatar = async (file: File): Promise<{ message: string; newAvatar: string }> => {
  return await api.patch('/users/edit/profile-avatar', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPastesByProfile = async (username: string): Promise<IUserPaste[]> => {
  return await api.get(`/users/profile/${username}/pastes`);
};

export const getUserPasteStats = async (username: string): Promise<IUserPastesStats> => {
  return await api.get(`/users/stats/${username}`);
};

export const searchSelfPastes = async (query: string) => {
  return await api.get(`/pastes/search-self?title=${query}`);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  return await api.patch('/users/change-password', data);
};

export const deleteAccount = async (username: string): Promise<{ message: string }> => {
  return await api.delete(`/users/${username}`);
};
