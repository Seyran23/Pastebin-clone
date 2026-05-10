import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface PasteCategoryAttributes {
  id?: number;
  category_name: string;
}

type PasteCategoryCreationAttributes = Optional<PasteCategoryAttributes, 'id'>;

export class PasteCategory
  extends Model<PasteCategoryAttributes, PasteCategoryCreationAttributes>
  implements PasteCategoryAttributes
{
  declare id: number;
  declare category_name: string;

  static initModel(sequelize: Sequelize): typeof PasteCategory {
    PasteCategory.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_name: { type: DataTypes.STRING, unique: true, allowNull: false },
      },
      { sequelize, modelName: 'PasteCategory', tableName: 'paste_categories', timestamps: false },
    );
    return PasteCategory;
  }
}
