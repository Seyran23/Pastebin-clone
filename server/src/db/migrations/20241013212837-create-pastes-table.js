// migrations/20241013212837-create-pastes-table.js
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pastes", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.fn("uuid_generate_v4"), 
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users", 
          key: "id",
        },
        onDelete: "CASCADE",
      },
      category: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: {
          model: "paste_categories",
          key: "id",
        },
      },
      syntax_highlight: {
        type: Sequelize.INTEGER, 
        allowNull: true,
        references: {
          model: "syntax_highlights",
          key: "id",
        },
      },
      exposure: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      link_endpoint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cloud_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiration_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      expired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pastes");
  },
};
