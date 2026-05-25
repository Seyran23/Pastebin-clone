'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('paste_categories', [
      { category_name: 'Cryptocurrency' },
      { category_name: 'Cybersecurity' },
      { category_name: 'Fixit' },
      { category_name: 'Food' },
      { category_name: 'Gaming' },
      { category_name: 'Haiku' },
      { category_name: 'Help' },
      { category_name: 'History' },
      { category_name: 'Housing' },
      { category_name: 'Jokes' },
      { category_name: 'Legal' },
      { category_name: 'Money' },
      { category_name: 'Movies' },
      { category_name: 'Music' },
      { category_name: 'Pets' },
      { category_name: 'Photo' },
      { category_name: 'Science' },
      { category_name: 'Software' },
      { category_name: 'Source Code' },
      { category_name: 'Spirit' },
      { category_name: 'Sports' },
      { category_name: 'Travel' },
      { category_name: 'TV' },
      { category_name: 'Writing' },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('paste_categories', null, {});
  }
};
