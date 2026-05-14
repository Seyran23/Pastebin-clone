export interface IUserProfile {
  id: string;
  avatar: string;
  location: string;
  createdAt: string;
}

export interface IUserPaste {
  id: string;
  name: string;
  link: string;
  exposure: 'public' | 'unlisted' | 'private';
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
