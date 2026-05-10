import { Sequelize } from 'sequelize';
import { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_LOCALHOST, NODE_ENV } from '../../utils/env';

import { User } from './user';
import { Paste } from './paste';
import { Comment } from './comment';
import { Token } from './token';
import { LikeStats } from './likestats';
import { PasteCategory } from './pastecategory';
import { SyntaxHighlights } from './syntaxhighlights';
import { ExpirationTime } from './expirationtime';

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_LOCALHOST,
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
Paste.belongsTo(SyntaxHighlights, { foreignKey: 'syntax_highlight_id', targetKey: 'id', as: 'syntaxHighlight' });

Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Paste, { foreignKey: 'paste_id', as: 'paste' });

Token.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

LikeStats.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
LikeStats.belongsTo(Paste, { foreignKey: 'paste_id', as: 'paste' });

PasteCategory.hasMany(Paste, { foreignKey: 'category_id', sourceKey: 'id', as: 'pastes' });
SyntaxHighlights.hasMany(Paste, { foreignKey: 'syntax_highlight_id', sourceKey: 'id', as: 'pastes' });

export {
  sequelize,
  Sequelize,
  User,
  Paste,
  Comment,
  Token,
  LikeStats,
  PasteCategory,
  SyntaxHighlights,
  ExpirationTime,
};
