// models/user.js
"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Paste, {
        foreignKey: "createdBy",
        as: "pastes"
      })

      User.hasOne(models.Token, {
        foreignKey: "user_id",
        as: "token"
      })

      User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' })
      User.hasMany(models.LikeStats, { foreignKey: 'user_id', as: 'likes' })

    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),  
        defaultValue: "user",  
      },
      isActivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      activationLink: {
        type: DataTypes.STRING,
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      location: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
