'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
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

    await queryInterface.bulkInsert('plans', [
      {
        id: '608fdb9a-f92f-4243-9d34-2d774c305463',
        name: 'FREE',
        metadata: JSON.stringify({
          max_workspaces: 2,
          max_sources_per_workspace: 5,
          max_active_agents: 1,
          knowledge_chat_quota: 100,
          support_conversation_quota: 100,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '993516df-7c0e-4aa9-853d-4d91065cb2e7',
        name: 'PRO',
        metadata: JSON.stringify({
          max_workspaces: 5,
          max_sources_per_workspace: 50,
          max_active_agents: 5,
          knowledge_chat_quota: 1000,
          support_conversation_quota: 2000,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '4a0156d9-4f40-4ef5-98e6-dbe5f147857c',
        name: 'BUSINESS',
        metadata: JSON.stringify({
          max_workspaces: -1,
          max_sources_per_workspace: 200,
          max_active_agents: 15,
          knowledge_chat_quota: 5000,
          support_conversation_quota: 10000,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plans');
  }
};
