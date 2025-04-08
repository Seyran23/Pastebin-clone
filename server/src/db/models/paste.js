// models/paste.js
"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Paste extends Model {
    static associate(models) {
      Paste.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "user",
      });
      Paste.hasMany(models.Comment, {
        foreignKey: "paste_id",
        as: "comments",
      });
      Paste.hasMany(models.LikeStats, {
        foreignKey: "paste_id",
        as: "likes",
      });
    }
  }
  Paste.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      syntax_highlight: {
        type: DataTypes.INTEGER, 
        allowNull: true,
        references: {
          model: "syntax_highlights", 
          key: "id",
        },
      },
      category: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
          model: "paste_categories", 
          key: "id",
        },
      },
      exposure: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      link_endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cloud_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiration_time: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    },
    {
      sequelize,
      tableName: "pastes",
      timestamps: true,
    }
  );

  return Paste;
};
