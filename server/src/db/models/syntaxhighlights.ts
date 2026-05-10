import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

export interface SyntaxHighlightsAttributes {
  id?: number;
  language: string;
}

type SyntaxHighlightsCreationAttributes = Optional<SyntaxHighlightsAttributes, 'id'>;

export class SyntaxHighlights
  extends Model<SyntaxHighlightsAttributes, SyntaxHighlightsCreationAttributes>
  implements SyntaxHighlightsAttributes
{
  declare id: number;
  declare language: string;

  static initModel(sequelize: Sequelize): typeof SyntaxHighlights {
    SyntaxHighlights.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        language: { type: DataTypes.STRING, unique: true, allowNull: false },
      },
      {
        sequelize,
        modelName: 'SyntaxHighlights',
        tableName: 'syntax_highlights',
        timestamps: false,
      },
    );
    return SyntaxHighlights;
  }
}
