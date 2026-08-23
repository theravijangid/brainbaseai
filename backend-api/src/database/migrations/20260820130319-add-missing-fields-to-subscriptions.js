'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'provider_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'currency', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'amount', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'billing_interval', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'cancel_at_period_end', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'provider_customer_id');
    await queryInterface.removeColumn('subscriptions', 'currency');
    await queryInterface.removeColumn('subscriptions', 'amount');
    await queryInterface.removeColumn('subscriptions', 'billing_interval');
    await queryInterface.removeColumn('subscriptions', 'cancel_at_period_end');
  }
};
