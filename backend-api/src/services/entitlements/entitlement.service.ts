import { Company } from '../../models/company.model'
import { Plan } from '../../models/plan.model'
import { Subscription } from '../../models/subscription.model'
import { Usage } from '../../models/usage.model'

export class EntitlementService {
  async getPlan(companyId: string): Promise<Plan | null> {
    const subscription = await Subscription.findOne({
      where: { companyId, status: 'active' },
      include: [Plan],
      order: [['createdAt', 'DESC']],
    })
    return subscription ? subscription.plan : null
  }

  async getEntitlements(companyId: string): Promise<Record<string, any>> {
    const plan = await this.getPlan(companyId)
    if (!plan) {
      // Default to free limits if no active plan is somehow found
      return {
        max_workspaces: 2,
        max_sources_per_workspace: 5,
        max_active_agents: 1,
        knowledge_chat_quota: 100,
        support_conversation_quota: 100,
      }
    }
    return plan.metadata
  }

  async canCreateWorkspace(companyId: string, currentWorkspaceCount: number): Promise<boolean> {
    const entitlements = await this.getEntitlements(companyId)
    if (entitlements.max_workspaces === -1) return true
    return currentWorkspaceCount < entitlements.max_workspaces
  }

  async canCreateSource(companyId: string, currentSourceCount: number): Promise<boolean> {
    const entitlements = await this.getEntitlements(companyId)
    if (entitlements.max_sources_per_workspace === -1) return true
    return currentSourceCount < entitlements.max_sources_per_workspace
  }

  async canCreateAgent(companyId: string, currentAgentCount: number): Promise<boolean> {
    const entitlements = await this.getEntitlements(companyId)
    if (entitlements.max_active_agents === -1) return true
    return currentAgentCount < entitlements.max_active_agents
  }

  async canUseKnowledgeChat(companyId: string): Promise<boolean> {
    const entitlements = await this.getEntitlements(companyId)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const usage = await Usage.sum('count', {
      where: {
        companyId,
        metric: 'knowledge_chat_messages',
        periodStart: startOfMonth,
      }
    })
    
    if (entitlements.knowledge_chat_quota === -1) return true
    return (usage || 0) < entitlements.knowledge_chat_quota
  }

  async canUseSupportConversation(companyId: string): Promise<boolean> {
    const entitlements = await this.getEntitlements(companyId)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const usage = await Usage.sum('count', {
      where: {
        companyId,
        metric: 'support_agent_conversations',
        periodStart: startOfMonth,
      }
    })
    
    if (entitlements.support_conversation_quota === -1) return true
    return (usage || 0) < entitlements.support_conversation_quota
  }
}

export default new EntitlementService()
