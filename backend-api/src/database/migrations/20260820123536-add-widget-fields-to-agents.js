'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('support_agents', 'public_key', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
    });
    
    await queryInterface.addColumn('support_agents', 'allowed_origins', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('support_agents', 'public_key');
    await queryInterface.removeColumn('support_agents', 'allowed_origins');
  }
};
