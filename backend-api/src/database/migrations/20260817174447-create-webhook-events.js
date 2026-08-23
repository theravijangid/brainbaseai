'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhook_events', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PROCESSED', 'FAILED'),
        allowNull: false,
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('webhook_events', ['provider', 'event_id'], {
      unique: true,
      name: 'webhook_events_provider_event_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('webhook_events');
  }
};
