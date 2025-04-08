// models/syntaxhighlights.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SyntaxHighlights extends Model {
    static associate(models) {
      SyntaxHighlights.hasMany(models.Paste, {
        foreignKey: "syntax_highlight",
        as: "pastes"
      });
    }
  }
  SyntaxHighlights.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    language: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SyntaxHighlights',
    tableName: "syntax_highlights",
    timestamps: false
  });
  return SyntaxHighlights;
};