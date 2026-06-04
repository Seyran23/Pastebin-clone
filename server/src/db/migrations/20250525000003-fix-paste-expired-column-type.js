'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE pastes ALTER COLUMN expired DROP DEFAULT',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE pastes ALTER COLUMN expired TYPE BOOLEAN USING CASE WHEN expired = 0 THEN FALSE ELSE TRUE END',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE pastes ALTER COLUMN expired SET DEFAULT FALSE',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pastes', 'expired', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
