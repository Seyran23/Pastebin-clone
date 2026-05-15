import type {
  ArchiveResponse,
  CreatePastePayload,
  CreatePasteResponse,
  IComment,
  IPasteInfo,
  IRecentPublicPaste,
  IUserComment,
  SearchPastesQuery,
  SearchPastesResponse,
} from '@/lib/types';

import api from './interceptor';

export const createPaste = async (data: CreatePastePayload): Promise<CreatePasteResponse> => {
  return await api.post('/pastes/create', data);
};

export const getPaste = async (link: string): Promise<IPasteInfo> => {
  return await api.get(`/pastes/${link}`);
};

export const getPublicPastes = async (): Promise<IRecentPublicPaste[]> => {
  return await api.get('/pastes/summary?type=public');
};

export const getMinePastes = async () => {
  return await api.get('/pastes/summary?type=mine');
};

export const deletePaste = async (id: string) => {
  return await api.delete(`/pastes/${id}`);
};

export const searchPastes = async (query: SearchPastesQuery): Promise<SearchPastesResponse> => {
  return await api.get('/pastes/search', { params: query });
};

export const getCategories = async (): Promise<string[]> => {
  return await api.get('/pastes/categories');
};

export const getExpirationTimes = async (): Promise<string[]> => {
  return await api.get('/pastes/expiration-time');
};

export const getSyntaxHighlights = async (): Promise<string[]> => {
  return await api.get('/pastes/syntax-highlights');
};

export const getArchive = async (cursor?: string, limit = 20): Promise<ArchiveResponse> => {
  return await api.get('/pastes/archive', { params: { cursor, limit } });
};

export const toggleLike = async (
  pasteId: string,
  isLike: boolean,
): Promise<{ message: string; likedStatus: boolean }> => {
  return await api.post(`/pastes/like/${pasteId}`, { isLike });
};

export const updatePaste = async (
  link: string,
  data: { name?: string; exposure?: string; password?: string | null },
): Promise<{ id: string; name: string; exposure: string }> => {
  return await api.patch(`/pastes/${link}`, data);
};

export const getComments = async (pasteId: string): Promise<IComment[]> => {
  return await api.get(`/pastes/comments/${pasteId}`);
};

export const getUserComments = async (username: string): Promise<IUserComment[]> => {
  return await api.get(`/pastes/user-comments/${username}`);
};

export const postComment = async (
  pasteId: string,
  content: string,
): Promise<IComment> => {
  return await api.post(`/pastes/comment/${pasteId}`, { content });
};
