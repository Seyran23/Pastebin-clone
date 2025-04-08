"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tokens", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      refreshToken: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tokens");
  },
};


// migrations/20241014133051-create-token.js
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tokens", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: { // Foreign key to users.id (UUID)
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users", // References the users table
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });

    await queryInterface.addConstraint("tokens", {
      fields: ["user_id"],
      type: "unique",
      name: "unique_user_token",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tokens");
  },
};