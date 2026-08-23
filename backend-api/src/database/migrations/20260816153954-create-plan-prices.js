'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plan_prices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider_price_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD',
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      interval: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.bulkInsert('plan_prices', [
      {
        id: uuidv4(),
        plan_id: '608fdb9a-f92f-4243-9d34-2d774c305463',
        provider: 'none',
        provider_price_id: 'free_monthly',
        currency: 'USD',
        amount: 0,
        interval: 'month',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plan_prices');
  }
};
