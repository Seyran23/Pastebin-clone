import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface TokenAttributes {
  id?: number;
  user_id: string;
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type TokenCreationAttributes = Optional<TokenAttributes, 'id'>;

export class Token
  extends Model<TokenAttributes, TokenCreationAttributes>
  implements TokenAttributes
{
  declare id: number;
  declare user_id: string;
  declare refreshToken: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Token {
    Token.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        refreshToken: { type: DataTypes.TEXT, allowNull: false },
      },
      { sequelize, modelName: 'Token', tableName: 'tokens', timestamps: true },
    );
    return Token;
  }
}
