'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('syntax_highlights', [
      { language: 'bash' },
      { language: 'c' },
      { language: 'c#' },
      { language: 'c++' },
      { language: 'css' },
      { language: 'html' },
      { language: 'json' },
      { language: 'java' },
      { language: 'javascript' },
      { language: 'python' },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('syntax_highlights', null, {});
 
  }
};
