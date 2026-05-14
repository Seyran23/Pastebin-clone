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
