import { SupportAgent } from '../models/support-agent.model';
import { Workspace } from '../models/workspace.model';
import { Source } from '../models/source.model';
import entitlementService from './entitlements/entitlement.service';
import { Op } from 'sequelize';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class SupportAgentService {
  static async createAgent(companyId: string, workspaceId: string, data: any) {
    const workspaces = await Workspace.findAll({ where: { companyId }, attributes: ['id'] });
    const workspaceIds = workspaces.map(w => w.id);
    const agentCount = await SupportAgent.count({ where: { workspaceId: { [Op.in]: workspaceIds } } });

    const canCreate = await entitlementService.canCreateAgent(companyId, agentCount);
    if (!canCreate) {
      throw new Error('PLAN_LIMIT_REACHED: Maximum active agents reached for this billing period.');
    }

    const totalSourcesCount = await Source.count({ where: { workspaceId } });
    if (totalSourcesCount === 0) {
      throw new Error('NO_SOURCES: Workspace must have at least one knowledge source before creating a support agent.');
    }

    if (data.knowledgeScope?.mode === 'selected') {
      if (!data.knowledgeScope?.sourceIds || data.knowledgeScope.sourceIds.length === 0) {
        throw new Error('VALIDATION_ERROR: At least one source must be selected.');
      }
      await this.validateSources(workspaceId, data.knowledgeScope.sourceIds);
    }

    return await SupportAgent.create({
      workspaceId,
      name: data.name,
      instructions: data.instructions,
      branding: data.branding,
      knowledgeScope: data.knowledgeScope,
      isPublic: data.isPublic || false
    });
  }

  static async updateAgent(agentId: string, workspaceId: string, data: any) {
    if (!UUID_REGEX.test(agentId) || !UUID_REGEX.test(workspaceId)) {
      throw new Error('Agent not found or unauthorized');
    }

    const agent = await SupportAgent.findOne({ where: { id: agentId, workspaceId } });
    if (!agent) throw new Error('Agent not found or unauthorized');

    if (data.knowledgeScope?.mode === 'selected' && data.knowledgeScope?.sourceIds) {
      await this.validateSources(workspaceId, data.knowledgeScope.sourceIds);
    }

    return await agent.update(data);
  }

  static async getAgent(agentId: string, workspaceId: string) {
    if (!UUID_REGEX.test(agentId) || !UUID_REGEX.test(workspaceId)) {
      throw new Error('Agent not found or unauthorized');
    }

    const agent = await SupportAgent.findOne({ where: { id: agentId, workspaceId } });
    if (!agent) throw new Error('Agent not found or unauthorized');
    return agent;
  }

  static async listAgents(workspaceId: string) {
    if (!UUID_REGEX.test(workspaceId)) return [];
    return await SupportAgent.findAll({ where: { workspaceId } });
  }

  private static async validateSources(workspaceId: string, sourceIds: string[]) {
    if (!sourceIds || sourceIds.length === 0) return;
    const count = await Source.count({ where: { id: { [Op.in]: sourceIds }, workspaceId } });
    if (count !== sourceIds.length) {
      throw new Error('VALIDATION_ERROR: One or more selected sources do not belong to this workspace or are invalid.');
    }
  }
}
