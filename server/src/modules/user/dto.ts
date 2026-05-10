import type { User } from '../../db/models/user';

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActivated: boolean;
  avatar: string | null;
  location: string | null;
  createdAt: Date | undefined;

  constructor(model: User) {
    this.id = model.id;
    this.username = model.username;
    this.email = model.email;
    this.role = model.role;
    this.isActivated = model.isActivated;
    this.avatar = model.avatar;
    this.location = model.location;
    this.createdAt = model.createdAt;
  }
}
