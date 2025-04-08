// models/comment.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Comment.belongsTo(models.Paste, { foreignKey: 'paste_id', as: 'paste', onDelete: 'CASCADE' });
    }
  }
  Comment.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paste_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pastes', 
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', 
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: "comments"
  });
  return Comment;
};