import api from "./interceptor";
import {
  CreatePastePayload,
  CreatePasteResponse,
  IAuthResponse,
  ICategory,
  IPasteInfo,
  IRecentPublicPaste,
  IUserInfo,
  IUserPaste,
  IUserPastesStats,
  IUserProfile,
  SearchPastesQuery,
  SearchPastesResponse,
} from "./models";

export const signupUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  return await api.post("/auth/signup", data);
};

export const loginUser = async (data: {
  username: string;
  password: string;
}): Promise<IAuthResponse> => {
  return await api.post("/auth/login", data);
};

export const refreshingTokens = async () => {
  return await api.get("/auth/refresh");
};

export const verifyEmail = async (
  activationLink: string
): Promise<IAuthResponse> => {
  return await api.get(`/auth/verify-email/${activationLink}`);
};

export const getUserProfile = async (username: string): Promise<IUserInfo> => {
  return await api.get(`/users/profile/${username}`);
};

export const updateProfile = async (data: {
  email: string;
  location: string;
}): Promise<{ message: string; user: IUserInfo }> => {
  return await api.patch("/users/edit/profile-details", data);
};

export const updateAvatar = async (
  file: File
): Promise<{ message: string; newAvatar: string }> => {
  return await api.patch("/users/edit/profile-avatar", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createPaste = async (data: CreatePastePayload): Promise<CreatePasteResponse> => {
  return await api.post('/pastes/create', data);

}

export const getPaste = async (link: string): Promise<IPasteInfo> => {
  return await api.get(`/pastes/${link}`);
};

export const getPublicPastes = async (): Promise<IRecentPublicPaste[]> => {
  return await api.get("/pastes/summary?type=public");
};

export const getMinePastes = async () => {
  return await api.get("/pastes/summary?type=mine");
};

export const deletePaste = async (id: string) => {
  return await api.delete(`/pastes/${id}`);
};

export const getPastesByProfile = async (
  username: string
): Promise<IUserPaste[]> => {
  return await api.get(`/users/profile/${username}/pastes`);
};

export const getUserPasteStats = async (
  username: string
): Promise<IUserPastesStats> => {
  return await api.get(`/users/stats/${username}`);
};

export const searchSelfPastes = async (query: string) => {
  return await api.get(`/pastes/search-self?title=${query}`);
};

export const searchPastes = async (
  query: SearchPastesQuery
): Promise<SearchPastesResponse> => {
  // axios will automatically serialize this { params } object into
  // ?searchTerm=...&category=... etc.
  return await api.get("/pastes/search", { params: query });
};

export const getCategories = async (): Promise<string[]> => {
  return await api.get("/pastes/categories");
};

export async function getExpirationTimes(): Promise<string[]> {
  return await api.get("/pastes/expiration-time");
}

export async function getSyntaxHighlights(): Promise<string[]> {
  return await api.get("/pastes/syntax-highlights");
}   
