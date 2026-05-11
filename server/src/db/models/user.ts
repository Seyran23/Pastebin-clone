import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string | null;
  googleId: string | null;
  role: 'user' | 'admin';
  isActivated: boolean;
  activationLink: string | null;
  avatar: string | null;
  location: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'role' | 'isActivated' | 'activationLink' | 'avatar' | 'location' | 'password' | 'googleId'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string | null;
  declare googleId: string | null;
  declare role: 'user' | 'admin';
  declare isActivated: boolean;
  declare activationLink: string | null;
  declare avatar: string | null;
  declare location: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: true },
        googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
        role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
        isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
        activationLink: { type: DataTypes.STRING, allowNull: true },
        avatar: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
        location: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
      },
      { sequelize, tableName: 'users', timestamps: true },
    );
    return User;
  }
}
