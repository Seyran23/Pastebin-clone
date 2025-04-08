// model/pastecategory.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PasteCategory extends Model {
    static associate(models) {

      PasteCategory.hasMany(models.Paste, {
        foreignKey: "category",
        as: "pastes"
      });
    }
  }
  PasteCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PasteCategory",
      tableName: "paste_categories",
      timestamps: false
    }
  );
  return PasteCategory;
};
