import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface PasteAttributes {
  id: string;
  createdBy: string;
  syntax_highlight_id: number | null;
  category_id: number | null;
  exposure: 'public' | 'private' | 'unlisted';
  password: string | null;
  name: string;
  link_endpoint: string;
  cloud_name: string;
  expiration_time: number | null;
  expired: boolean;
  size: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PasteCreationAttributes = Optional<
  PasteAttributes,
  'id' | 'syntax_highlight_id' | 'category_id' | 'password' | 'expiration_time' | 'expired' | 'size'
>;

export class Paste extends Model<PasteAttributes, PasteCreationAttributes> implements PasteAttributes {
  declare id: string;
  declare createdBy: string;
  declare syntax_highlight_id: number | null;
  declare category_id: number | null;
  declare exposure: 'public' | 'private' | 'unlisted';
  declare password: string | null;
  declare name: string;
  declare link_endpoint: string;
  declare cloud_name: string;
  declare expiration_time: number | null;
  declare expired: boolean;
  declare size: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations (populated by eager loading)
  declare user?: import('./user').User;
  declare category?: import('./pastecategory').PasteCategory;
  declare syntaxHighlight?: import('./syntaxhighlights').SyntaxHighlights;
  declare comments?: import('./comment').Comment[];
  declare likes?: import('./likestats').LikeStats[];

  static initModel(sequelize: Sequelize): typeof Paste {
    Paste.init(
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        createdBy: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        syntax_highlight_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'syntax_highlights', key: 'id' },
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'paste_categories', key: 'id' },
        },
        exposure: { type: DataTypes.ENUM('public', 'private', 'unlisted'), allowNull: false },
        password: { type: DataTypes.STRING, allowNull: true },
        name: { type: DataTypes.STRING, allowNull: false },
        link_endpoint: { type: DataTypes.STRING, allowNull: false },
        cloud_name: { type: DataTypes.STRING, allowNull: false },
        expiration_time: { type: DataTypes.BIGINT, allowNull: true },
        expired: { type: DataTypes.BOOLEAN, defaultValue: false },
        size: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { sequelize, tableName: 'pastes', timestamps: true }
    );
    return Paste;
  }
}
