import { SupportAgent } from '../models/support-agent.model';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { Usage } from '../models/usage.model';
import entitlementService from './entitlements/entitlement.service';
import { SupportAgentRagService } from './rag/support-agent-rag.service';
import { PromptInjectionService } from './security/prompt-injection.service';
import sequelize from '../database';

export class SupportAgentChatService {
  static async chat(
    companyId: string,
    workspaceId: string,
    agentId: string,
    messages: any[],
    reqConversationId?: string
  ) {
    const agent = await SupportAgent.findOne({ where: { id: agentId, workspaceId } });
    if (!agent) throw new Error('Agent not found or unauthorized');

    let conversationId = reqConversationId;
    if (!conversationId) {
      const canUse = await entitlementService.canUseSupportConversation(companyId);
      if (!canUse) {
        throw new Error('PLAN_LIMIT_REACHED: Maximum support conversations reached for this billing period.');
      }
    }

    const lastUserMsg = messages[messages.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') {
      throw new Error('The last message must be from the user.');
    }
    if (messages.length > 40) {
      throw new Error('CONVERSATION_LIMIT_REACHED: Maximum messages per conversation reached. Please start a new conversation.');
    }
    
    const injectionDecision = await PromptInjectionService.evaluateInput(lastUserMsg.content);
    if (!injectionDecision.isSafe) {
      throw new Error('Unsafe input detected: ' + (injectionDecision.reason || 'Prompt injection attempted.'));
    }

    let sourceIds: string[] | undefined = undefined;
    if (agent.knowledgeScope?.mode === 'selected' && agent.knowledgeScope.sourceIds) {
      sourceIds = agent.knowledgeScope.sourceIds;
    }

    const fallbackResponse = agent.branding?.fallbackMessage || "I couldn't find that information in our knowledge base. Please contact support.";
    
    const chatMessages = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant');

    const ragRes = await SupportAgentRagService.executeSupportRag(workspaceId, chatMessages, {
      sourceIds,
      fallbackResponse,
      instructions: agent.instructions || undefined,
      branding: agent.branding || undefined,
    });

    const t = await sequelize.transaction();
    try {
      if (!conversationId) {
        let title = lastUserMsg.content.trim();
        if (title.length > 40) {
          title = title.substring(0, 37) + '...';
        }

        const conversation = await Conversation.create({
          workspaceId,
          supportAgentId: agent.id,
          title,
        }, { transaction: t });
        conversationId = conversation.id;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [usageRecord] = await Usage.findOrCreate({
          where: { companyId, metric: 'support_agent_conversations', periodStart: startOfMonth },
          defaults: {
            companyId,
            metric: 'support_agent_conversations',
            count: 0,
            periodStart: startOfMonth,
            periodEnd: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0),
          },
          transaction: t
        });
        await usageRecord.increment('count', { transaction: t });
      }

      await Message.create({
        conversationId,
        role: 'user',
        content: lastUserMsg.content,
      }, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }

    return {
      conversationId,
      result: ragRes.result,
      fallbackResponse: ragRes.fallbackResponse,
    };
  }
}
