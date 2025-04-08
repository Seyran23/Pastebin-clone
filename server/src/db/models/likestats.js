  // models/likestats.js
  'use strict';
  const {
    Model
  } = require('sequelize');
  module.exports = (sequelize, DataTypes) => {
    class LikeStats extends Model {

      static associate(models) {
        LikeStats.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        LikeStats.belongsTo(models.Paste, { foreignKey: 'paste_id', as: 'paste', onDelete: 'CASCADE' });
      }
    }
    LikeStats.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      paste_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'pastes', 
          key: 'id',
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users', 
          key: 'id',
        },
        onDelete: "CASCADE",
      },
      is_liked: {
        type: DataTypes.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }, {
      sequelize,
      modelName: 'LikeStats',
      tableName: "like_stats",
      indexes: [
        {
          unique: true,
          fields: ['paste_id', 'user_id'],
        },
      ],
    });
    return LikeStats;
  };