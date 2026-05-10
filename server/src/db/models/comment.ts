import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface CommentAttributes {
  id?: number;
  content: string;
  paste_id: string;
  user_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<CommentAttributes, 'id'>;

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  declare id: number;
  declare content: string;
  declare paste_id: string;
  declare user_id: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Comment {
    Comment.init(
      {
        content: { type: DataTypes.TEXT, allowNull: false },
        paste_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'pastes', key: 'id' },
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
      },
      { sequelize, modelName: 'Comment', tableName: 'comments', timestamps: true },
    );
    return Comment;
  }
}
