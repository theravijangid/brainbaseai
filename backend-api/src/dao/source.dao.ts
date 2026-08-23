import { Transaction } from 'sequelize'
import { Source, SourceType, SourceStatus } from '../models/source.model'

export interface CreateSourceDTO {
  workspaceId: string
  name: string
  type: SourceType
  storageKey?: string
  originalUrl?: string
  status?: SourceStatus
  metadata?: Record<string, any>
}

export class SourceDao {
  async createSource(data: CreateSourceDTO, options?: { transaction?: Transaction }): Promise<Source> {
    return Source.create({
      workspaceId: data.workspaceId,
      name: data.name,
      type: data.type,
      storageKey: data.storageKey,
      originalUrl: data.originalUrl,
      status: data.status || 'QUEUED',
      metadata: data.metadata || {},
    }, { transaction: options?.transaction })
  }

  async findSourcesByWorkspaceId(workspaceId: string, options?: { transaction?: Transaction }): Promise<Source[]> {
    return Source.findAll({
      where: { workspaceId },
      order: [['createdAt', 'DESC']],
      transaction: options?.transaction,
    })
  }

  async findSourceByIdAndWorkspace(id: string, workspaceId: string, options?: { transaction?: Transaction }): Promise<Source | null> {
    return Source.findOne({
      where: { id, workspaceId },
      transaction: options?.transaction,
    })
  }

  async updateSourceStatus(
    id: string,
    workspaceId: string,
    status: SourceStatus,
    metadata?: Record<string, any>,
    options?: { transaction?: Transaction }
  ): Promise<Source | null> {
    const source = await this.findSourceByIdAndWorkspace(id, workspaceId, options)
    if (!source) return null

    const updatedMetadata = metadata
      ? { ...(source.metadata || {}), ...metadata }
      : source.metadata

    return source.update({
      status,
      metadata: updatedMetadata,
    }, { transaction: options?.transaction })
  }

  async deleteSource(id: string, workspaceId: string, options?: { transaction?: Transaction }): Promise<boolean> {
    const source = await this.findSourceByIdAndWorkspace(id, workspaceId, options)
    if (!source) return false
    await source.destroy({ transaction: options?.transaction })
    return true
  }
}

export default new SourceDao()

