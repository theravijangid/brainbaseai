import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { SupportAgent } from '../models/support-agent.model';

export class ConversationDAO {
  static async listConversations(workspaceId: string, statusFilter?: string, type?: string) {
    const whereClause: any = { workspaceId };
    
    if (statusFilter && statusFilter !== 'All') {
      whereClause.status = statusFilter.toLowerCase();
    }

    if (type === 'internal') {
      whereClause.supportAgentId = null;
    } else if (type === 'external') {
      whereClause.supportAgentId = { [require('sequelize').Op.ne]: null };
    }

    return await Conversation.findAll({
      where: whereClause,
      include: [
        {
          model: SupportAgent,
          as: 'supportAgent',
          attributes: ['id', 'name'],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['content', 'createdAt'],
        }
      ],
      order: [['updatedAt', 'DESC']],
    });
  }

  static async getConversationById(id: string, workspaceId: string) {
    return await Conversation.findOne({
      where: { id, workspaceId },
      include: [
        {
          model: SupportAgent,
          as: 'supportAgent',
          attributes: ['id', 'name'],
        },
        {
          model: Message,
          as: 'messages',
        }
      ],
      order: [[{ model: Message, as: 'messages' }, 'createdAt', 'ASC']],
    });
  }

  static async updateConversationStatus(id: string, workspaceId: string, status: string) {
    const conversation = await Conversation.findOne({ where: { id, workspaceId } });
    if (!conversation) {
      return null;
    }
    
    conversation.status = status;
    await conversation.save();
    return conversation;
  }

  static async deleteConversation(id: string, workspaceId: string) {
    const conversation = await Conversation.findOne({ where: { id, workspaceId } });
    if (!conversation) {
      return false;
    }
    
    await conversation.destroy();
    return true;
  }
}

export default ConversationDAO;
