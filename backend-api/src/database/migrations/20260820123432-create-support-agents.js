'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('support_agents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspaces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      branding: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      knowledge_scope: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addColumn('conversations', 'support_agent_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'support_agents',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'support_agent_id');
    await queryInterface.dropTable('support_agents');
  }
};
