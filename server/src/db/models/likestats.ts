import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface LikeStatsAttributes {
  id?: number;
  paste_id: string;
  user_id: string;
  is_liked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type LikeStatsCreationAttributes = Optional<LikeStatsAttributes, 'id'>;

export class LikeStats
  extends Model<LikeStatsAttributes, LikeStatsCreationAttributes>
  implements LikeStatsAttributes
{
  declare id: number;
  declare paste_id: string;
  declare user_id: string;
  declare is_liked: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof LikeStats {
    LikeStats.init(
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        paste_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'pastes', key: 'id' },
          onDelete: 'CASCADE',
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        is_liked: { type: DataTypes.BOOLEAN },
      },
      {
        sequelize,
        modelName: 'LikeStats',
        tableName: 'like_stats',
        indexes: [{ unique: true, fields: ['paste_id', 'user_id'] }],
      },
    );
    return LikeStats;
  }
}
