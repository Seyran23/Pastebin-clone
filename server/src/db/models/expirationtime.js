// model/expirationtime.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExpirationTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ExpirationTime.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      duration: {
        type: DataTypes.BIGINT,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "ExpirationTime",
      tableName: "expiration_times",
      timestamps: false
    }
  );
  return ExpirationTime;
};
