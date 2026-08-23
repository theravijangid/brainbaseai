import { Request, Response } from 'express'
import ApiResponseHandler from '../helpers/api-response-handling.class'
import companyDao from '../dao/company.dao'
import Logger from '../config/logger'
import { Workspace, Source, SupportAgent, Usage } from '../models'
import entitlementService from '../services/entitlements/entitlement.service'
import { Op } from 'sequelize'
import sequelize from '../database'

export class CompanyController {
  async onboard(req: Request, res: Response): Promise<void> {
    const t = await sequelize.transaction()
    try {
      const user = req.user
      if (!user) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'User not authenticated')
        return
      }

      const { name, website, industry, companySize, country, description, supportEmail, workspaceName } = req.body

      if (!name) {
        ApiResponseHandler.handleBadRequest(res, 'Company name is required')
        return
      }

      const company = await companyDao.onboardCompany(user, {
        name,
        website,
        industry,
        companySize,
        country,
        description,
        supportEmail,
        workspaceName,
      }, { transaction: t })

      await t.commit()

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Company onboarded successfully',
        company
      )
    } catch (error: any) {
      await t.rollback()
      Logger.error(`Error onboarding company: ${error.message}`)
      if (error.message.includes('already has an associated company')) {
        ApiResponseHandler.handleBadRequest(res, error.message)
      } else {
        ApiResponseHandler.handleErrorReponse(res, 'Failed to onboard company', error.message)
      }
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'User not authenticated')
        return
      }

      // If user is authenticated, their company is attached to req.company (if it exists)
      ApiResponseHandler.handleSuccessResponse(
        res,
        'Company details fetched successfully',
        req.company || null
      )
    } catch (error: any) {
      Logger.error(`Error fetching company details: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch company details', error.message)
    }
  }

  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'User has no company')
        return
      }

      const { name, website, industry, companySize, country, description, supportEmail } = req.body

      const updatedCompany = await companyDao.updateCompany(company.id, {
        name,
        website,
        industry,
        companySize,
        country,
        description,
        supportEmail,
      })

      if (!updatedCompany) {
        ApiResponseHandler.handleErrorReponse(res, 'Company not found', 'Failed to update company')
        return
      }

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Company settings updated successfully',
        updatedCompany
      )
    } catch (error: any) {
      Logger.error(`Error updating company details: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to update company settings', error.message)
    }
  }

  async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'User has no company')
        return
      }

      const plan = await entitlementService.getPlan(company.id)
      const limits = await entitlementService.getEntitlements(company.id)

      const workspacesCount = await Workspace.count({ where: { companyId: company.id } })
      
      const workspaces = await Workspace.findAll({
        where: { companyId: company.id },
        attributes: ['id']
      })
      const workspaceIds = workspaces.map(w => w.id)

      let sourcesCount = 0
      let agentsCount = 0
      if (workspaceIds.length > 0) {
        sourcesCount = await Source.count({ where: { workspaceId: { [Op.in]: workspaceIds } } })
        agentsCount = await SupportAgent.count({ where: { workspaceId: { [Op.in]: workspaceIds } } })
      }

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const knowledgeChatUsage = await Usage.sum('count', {
        where: {
          companyId: company.id,
          metric: 'knowledge_chat_messages',
          periodStart: startOfMonth,
        }
      }) || 0

      const supportChatUsage = await Usage.sum('count', {
        where: {
          companyId: company.id,
          metric: 'support_agent_conversations',
          periodStart: startOfMonth,
        }
      }) || 0

      const usage = {
        plan,
        usage: {
          workspaces: { used: workspacesCount, limit: limits.max_workspaces },
          sources: { used: sourcesCount, limit: limits.max_sources_per_workspace === -1 ? 'Unlimited' : limits.max_sources_per_workspace * workspacesCount },
          agents: { used: agentsCount, limit: limits.max_active_agents },
          knowledgeChat: { used: knowledgeChatUsage, limit: limits.knowledge_chat_quota },
          supportConversations: { used: supportChatUsage, limit: limits.support_conversation_quota },
        }
      }

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Company usage fetched successfully',
        usage
      )
    } catch (error: any) {
      Logger.error(`Error fetching company usage: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch company usage', error.message)
    }
  }
}

export default new CompanyController()
