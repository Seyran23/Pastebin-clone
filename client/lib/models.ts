export interface CustomError {
  message: string;
  errors: { field: string; message: string; cause?: string }[] | [];
}

export type Exposure = "public" | "unlisted" | "private";

export interface IRelatedPage {
  href: string;
  label: string;
}

export interface IUserInfo {
  id: string;
  email: string;
  username: string;
  isActivated: boolean;
  avatar: string;
  location: string;
  createdAt: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUserInfo;
}

export interface IRecentPublicPaste {
  id: string;
  linkEndpoint: string;
  title: string;
  exposure: Exposure;
  createdAt: string;
  size: number;
  category: {
    id: number;
    name: string;
  } | null;
  syntaxHighlight: {
    id: number;
    name: string;
  } | null;
}

export interface CreatePastePayload {
  name: string;
  exposure: string;
  syntaxHighlight: number | null;
  category: number | null;
  expirationTime: string;
  password: string | null;
  content: string;
}

export interface CreatePasteResponse {
  id: string;
  category: number | null;
  createdAt: string;
  createdBy: string;
  expirationTime: string | null;
  exposure: "public" | "unlisted" | "private";
  linkEndpoint: string;
  size: number;
  syntaxHighlight: number | null;
  title: string;
  updatedAt: string;
}

export interface IPasteInfo {
  pasteData: {
    id: string;
    createdBy: string;
    title: string;
    linkEndpoint: string;
    exposure: Exposure;
    createdAt: string;
    updatedAt: string;
    expirationTime: number | null;
    size: number;
    category: {
      id: number;
      name: string;
    } | null;
    syntaxHighlight: {
      id: number;
      name: string;
    } | null;

    content: string;
    contentType: string;
    likes: number;
    dislikes: number;
  } | null;
  owner: {
    id: string;
    username: string;
    avatar: string;
  } | null;
  remainingTime: number | null;
  requiresPassword: boolean;
  viewCount: number;
}

export interface IUserPaste {
  id: string;
  name: string;
  link: string;
  exposure: "public" | "unlisted" | "private";
  addedAt: string;
  expires: string;
  comments: string;
  syntax: string;
}

export interface IUserPastesStats {
  totalActivePastes: number;
  publicPastes: number;
  unlistedPastes: number;
  privatePastes: number;
  totalLikes: number;
}

export interface IUserProfile {
  id: string;
  avatar: string;
}

export interface SearchPastesQuery {
  searchTerm?: string;
  category?: string;
  sort?: "newest" | "oldest" | "comments" | "likes";
  time?: "all" | "day" | "week" | "month" | "year";
  cursor?: string;
  limit?: number;
  direction?: "next" | "prev";
}

export interface SearchPastesResponse {
  data: {
    id: string;
    name: string;
    link: string;
    size: number;
    createdAt: string;
    expiresAt: string | null;
    category: string | null;
    syntaxHighlight: string | null;
    author: string | null;
    preview: string | null;
    remainingTime: number | null;
    likes: number;
  }[];
  pagination: {
    hasNextPage: false;
    hasPrevPage: false;
    nextCursor: string | null;
    prevCursor: string | null;
    itemsPerPage: number;
  };
}
