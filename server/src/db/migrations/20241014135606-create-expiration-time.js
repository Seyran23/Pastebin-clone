"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expiration_times", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      duration: {
        type: Sequelize.BIGINT,
        unique: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("expiration_times");
  },
};
