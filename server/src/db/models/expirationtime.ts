import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface ExpirationTimeAttributes {
  id?: number;
  label: string;
  duration: number | null;
}

type ExpirationTimeCreationAttributes = Optional<ExpirationTimeAttributes, 'id'>;

export class ExpirationTime
  extends Model<ExpirationTimeAttributes, ExpirationTimeCreationAttributes>
  implements ExpirationTimeAttributes
{
  declare id: number;
  declare label: string;
  declare duration: number | null;

  static initModel(sequelize: Sequelize): typeof ExpirationTime {
    ExpirationTime.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        label: { type: DataTypes.STRING, unique: true, allowNull: false },
        duration: { type: DataTypes.BIGINT, allowNull: true },
      },
      { sequelize, modelName: 'ExpirationTime', tableName: 'expiration_times', timestamps: false }
    );
    return ExpirationTime;
  }
}
