'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'open',
    });

    await queryInterface.addColumn('conversations', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Visitor',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'status');
    await queryInterface.removeColumn('conversations', 'customer_name');
  }
};
