'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     
      await queryInterface.bulkInsert('expiration_times', [
        { label: '2 minutes', duration: 2 * 60 * 1000 },
        { label: '10 minutes', duration: 10 * 60 * 1000 },
        { label: '1 hour', duration: 60 * 60 * 1000 },
        { label: '1 day', duration: 24 * 60 * 60 * 1000 },
        { label: '1 week', duration: 7 * 24 * 60 * 60 * 1000},
        { label: '2 weeks', duration: 14 * 24 * 60 * 60 * 1000},
        { label: '1 month', duration:  30 * 24 * 60 * 60 * 1000},
        { label: '6 months', duration: 6 * 30 * 24 * 60 * 60 * 1000},
        { label: '1 year', duration:  12 * 30 * 24 * 60 * 60 * 1000},
        { label: 'never', duration: null },
      ], {});
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expiration_times", null, {})
  }
};
