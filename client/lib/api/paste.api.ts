import {
  CreatePastePayload,
  CreatePasteResponse,
  IPasteInfo,
  IRecentPublicPaste,
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
