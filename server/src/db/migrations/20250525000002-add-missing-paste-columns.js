'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('pastes');

    if (!tableDesc.size) {
      await queryInterface.addColumn('pastes', 'size', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDesc.preview) {
      await queryInterface.addColumn('pastes', 'preview', {
        type: Sequelize.STRING(300),
        allowNull: true,
      });
    }

    if (!tableDesc.view_count) {
      await queryInterface.addColumn('pastes', 'view_count', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pastes', 'size');
    await queryInterface.removeColumn('pastes', 'preview');
    await queryInterface.removeColumn('pastes', 'view_count');
  },
};
