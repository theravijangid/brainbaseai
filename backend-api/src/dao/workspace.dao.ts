import { Workspace } from '../models/workspace.model'
import { Source } from '../models/source.model'
import { Conversation } from '../models/conversation.model'
import { Transaction } from 'sequelize'

export interface CreateWorkspaceDTO {
  companyId: string
  name: string
  description?: string
}

export interface UpdateWorkspaceDTO {
  name?: string
  description?: string
}

export class WorkspaceDao {
  async createWorkspace(data: CreateWorkspaceDTO, options?: { transaction?: Transaction }): Promise<Workspace> {
    return Workspace.create({
      companyId: data.companyId,
      name: data.name,
      description: data.description,
    }, { transaction: options?.transaction })
  }

  async findWorkspacesByCompanyId(companyId: string): Promise<Workspace[]> {
    return Workspace.findAll({
      where: { companyId },
      include: ['sources', 'conversations'],
      order: [['createdAt', 'DESC']],
    })
  }

  async findWorkspaceByIdAndCompany(id: string, companyId: string): Promise<Workspace | null> {
    return Workspace.findOne({
      where: { id, companyId },
      include: ['sources', 'conversations'],
      order: [['conversations', 'createdAt', 'DESC']],
    })
  }

  async updateWorkspace(
    id: string,
    companyId: string,
    data: UpdateWorkspaceDTO
  ): Promise<Workspace | null> {
    const workspace = await this.findWorkspaceByIdAndCompany(id, companyId)
    if (!workspace) return null
    return workspace.update(data)
  }

  async deleteWorkspace(id: string, companyId: string): Promise<boolean> {
    const workspace = await this.findWorkspaceByIdAndCompany(id, companyId)
    if (!workspace) return false
    await workspace.destroy()
    return true
  }

  async getWorkspaceAnalytics(id: string, startDate: Date) {
    const { Op, Sequelize } = require('sequelize')
    const { SupportAgent } = require('../models/support-agent.model')
    
    const sourcesCount = await Source.count({ where: { workspaceId: id } })
    const activeAgentsCount = await SupportAgent.count({ where: { workspaceId: id } })

    // Aggregate Conversations
    const totalConversations = await Conversation.count({
      where: { workspaceId: id, createdAt: { [Op.gte]: startDate } }
    })

    const aiConversations = await Conversation.count({
      where: { workspaceId: id, supportAgentId: { [Op.not]: null }, createdAt: { [Op.gte]: startDate } }
    })

    const knowledgeChatUsage = await Conversation.count({
      where: { workspaceId: id, supportAgentId: null, createdAt: { [Op.gte]: startDate } }
    })

    // Aggregate Trend
    const trendDataRaw = await Conversation.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'day'],
        [Sequelize.fn('sum', Sequelize.literal('CASE WHEN "support_agent_id" IS NOT NULL THEN 1 ELSE 0 END')), 'conversations'],
        [Sequelize.fn('sum', Sequelize.literal('CASE WHEN "support_agent_id" IS NULL THEN 1 ELSE 0 END')), 'knowledge']
      ],
      where: {
        workspaceId: id,
        createdAt: { [Op.gte]: startDate }
      },
      group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'ASC']],
      raw: true
    })

    const conversationTrend = trendDataRaw.map((row: any) => {
      const d = new Date(row.day)
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      return {
        day: dayStr,
        conversations: parseInt(row.conversations) || 0,
        knowledge: parseInt(row.knowledge) || 0
      }
    })

    // Agent Performance
    const agentPerformanceRaw = await Conversation.findAll({
      attributes: [
        'supportAgentId',
        [Sequelize.fn('count', Sequelize.col('Conversation.id')), 'v']
      ],
      include: [{
        model: SupportAgent,
        attributes: ['name'],
      }],
      where: {
        workspaceId: id,
        supportAgentId: { [Op.not]: null },
        createdAt: { [Op.gte]: startDate }
      },
      group: ['supportAgentId', 'supportAgent.id', 'supportAgent.name'],
      raw: true,
      nest: true
    })

    const agentPerformance = agentPerformanceRaw.map((row: any) => ({
      n: row.supportAgent?.name || 'Unknown Agent',
      v: parseInt(row.v) || 0
    }))

    return {
      totalConversations,
      aiConversations,
      knowledgeChatUsage,
      supportAgentUsage: activeAgentsCount,
      conversationTrend,
      agentPerformance,
      sources: sourcesCount,
      agents: activeAgentsCount
    }
  }
}

export default new WorkspaceDao()
