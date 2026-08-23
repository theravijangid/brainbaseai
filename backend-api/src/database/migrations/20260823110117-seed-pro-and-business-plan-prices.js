'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('plan_prices', [
      {
        id: uuidv4(),
        plan_id: '993516df-7c0e-4aa9-853d-4d91065cb2e7',
        provider: 'razorpay',
        provider_price_id: 'pro_monthly',
        currency: 'USD',
        amount: 1200,
        interval: 'month',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        plan_id: '4a0156d9-4f40-4ef5-98e6-dbe5f147857c',
        provider: 'razorpay',
        provider_price_id: 'business_monthly',
        currency: 'USD',
        amount: 3900,
        interval: 'month',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('plan_prices', {
      plan_id: [
        '993516df-7c0e-4aa9-853d-4d91065cb2e7',
        '4a0156d9-4f40-4ef5-98e6-dbe5f147857c',
      ],
    });
  },
};
