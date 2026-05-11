import { Sequelize } from 'sequelize';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, NODE_ENV } from '@/utils/env';

import { Comment } from './comment';
import { ExpirationTime } from './expirationtime';
import { LikeStats } from './likestats';
import { Paste } from './paste';
import { PasteCategory } from './pastecategory';
import { SyntaxHighlights } from './syntaxhighlights';
import { Token } from './token';
import { User } from './user';

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? false : false,
});

// Initialize all models
User.initModel(sequelize);
Paste.initModel(sequelize);
Comment.initModel(sequelize);
Token.initModel(sequelize);
LikeStats.initModel(sequelize);
PasteCategory.initModel(sequelize);
SyntaxHighlights.initModel(sequelize);
ExpirationTime.initModel(sequelize);

// Associations
User.hasMany(Paste, { foreignKey: 'createdBy', as: 'pastes' });
User.hasOne(Token, { foreignKey: 'user_id', as: 'token' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(LikeStats, { foreignKey: 'user_id', as: 'likes' });

Paste.belongsTo(User, { foreignKey: 'createdBy', as: 'user' });
Paste.hasMany(Comment, { foreignKey: 'paste_id', as: 'comments' });
Paste.hasMany(LikeStats, { foreignKey: 'paste_id', as: 'likes' });
Paste.belongsTo(PasteCategory, { foreignKey: 'category_id', targetKey: 'id', as: 'category' });
Paste.belongsTo(SyntaxHighlights, {
  foreignKey: 'syntax_highlight_id',
  targetKey: 'id',
  as: 'syntaxHighlight',
});

Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Paste, { foreignKey: 'paste_id', as: 'paste' });

Token.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

LikeStats.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
LikeStats.belongsTo(Paste, { foreignKey: 'paste_id', as: 'paste' });

PasteCategory.hasMany(Paste, { foreignKey: 'category_id', sourceKey: 'id', as: 'pastes' });
SyntaxHighlights.hasMany(Paste, {
  foreignKey: 'syntax_highlight_id',
  sourceKey: 'id',
  as: 'pastes',
});

export {
  Comment,
  ExpirationTime,
  LikeStats,
  Paste,
  PasteCategory,
  Sequelize,
  sequelize,
  SyntaxHighlights,
  Token,
  User,
};
