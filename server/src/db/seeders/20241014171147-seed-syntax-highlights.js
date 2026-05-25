'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('syntax_highlights', [
      { language: 'Bash' },
      { language: 'C' },
      { language: 'C#' },
      { language: 'C++' },
      { language: 'CSS' },
      { language: 'HTML' },
      { language: 'JSON' },
      { language: 'Java' },
      { language: 'JavaScript' },
      { language: 'Python' },
    ], { ignoreDuplicates: true });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('syntax_highlights', null, {});
 
  }
};
