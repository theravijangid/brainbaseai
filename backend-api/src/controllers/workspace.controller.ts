import { Request, Response } from 'express'
import ApiResponseHandler from '../helpers/api-response-handling.class'
import workspaceDao from '../dao/workspace.dao'
import entitlementService from '../services/entitlements/entitlement.service'
import Logger from '../config/logger'
import { Source, SupportAgent, Conversation, Message } from '../models'
import { Op, Sequelize } from 'sequelize'

export class WorkspaceController {
  /**
   * POST /api/v1/workspaces
   * Create a new workspace for authenticated user
   */
  async createWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const existingWorkspaces = await workspaceDao.findWorkspacesByCompanyId(company.id)
      const canCreate = await entitlementService.canCreateWorkspace(company.id, existingWorkspaces.length)
      if (!canCreate) {
        ApiResponseHandler.handleForbiddenRequest(res, 'PLAN_LIMIT_REACHED: Maximum workspaces allowed by your plan has been reached.')
        return
      }

      const { name, description } = req.body
      const workspace = await workspaceDao.createWorkspace({
        companyId: company.id,
        name,
        description,
      })

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspace created successfully',
        workspace
      )
    } catch (error: any) {
      Logger.error(`Error creating workspace: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to create workspace', error.message)
    }
  }

  /**
   * GET /api/v1/workspaces
   * List all workspaces owned by authenticated user
   */
  async listWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const workspaces = await workspaceDao.findWorkspacesByCompanyId(company.id)

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspaces fetched successfully',
        workspaces
      )
    } catch (error: any) {
      Logger.error(`Error listing workspaces: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to list workspaces', error.message)
    }
  }

  /**
   * GET /api/v1/workspaces/:id
   * Get workspace details by ID
   */
  async getWorkspaceById(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      const { id } = req.params

      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const workspace = await workspaceDao.findWorkspaceByIdAndCompany(id, company.id)

      if (!workspace) {
        ApiResponseHandler.handleNotFoundRequest(res, 'Workspace not found')
        return
      }

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspace details fetched successfully',
        workspace
      )
    } catch (error: any) {
      Logger.error(`Error fetching workspace: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch workspace', error.message)
    }
  }

  /**
   * PUT /api/v1/workspaces/:id
   * Update workspace details
   */
  async updateWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      const { id } = req.params

      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const workspace = await workspaceDao.updateWorkspace(id, company.id, req.body)

      if (!workspace) {
        ApiResponseHandler.handleNotFoundRequest(res, 'Workspace not found')
        return
      }

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspace updated successfully',
        workspace
      )
    } catch (error: any) {
      Logger.error(`Error updating workspace: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to update workspace', error.message)
    }
  }

  /**
   * DELETE /api/v1/workspaces/:id
   * Delete workspace by ID
   */
  async deleteWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      const { id } = req.params

      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const deleted = await workspaceDao.deleteWorkspace(id, company.id)

      if (!deleted) {
        ApiResponseHandler.handleNotFoundRequest(res, 'Workspace not found')
        return
      }

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspace deleted successfully',
        { id }
      )
    } catch (error: any) {
      Logger.error(`Error deleting workspace: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to delete workspace', error.message)
    }
  }

  /**
   * GET /api/v1/workspaces/:id/analytics
   * Get analytics for a specific workspace
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company
      const { id } = req.params

      if (!company) {
        ApiResponseHandler.handleUnauthorizedRequest(res, 'Company context missing')
        return
      }

      const days = parseInt(req.query.days as string) || 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const analyticsData = await workspaceDao.getWorkspaceAnalytics(id, startDate)

      ApiResponseHandler.handleSuccessResponse(
        res,
        'Workspace analytics fetched successfully',
        analyticsData
      )
    } catch (error: any) {
      Logger.error(`Error fetching workspace analytics: ${error.message}`)
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch workspace analytics', error.message)
    }
  }
}

export default new WorkspaceController()
