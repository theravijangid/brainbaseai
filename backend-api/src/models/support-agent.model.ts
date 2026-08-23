import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'
import type { Workspace as WorkspaceType } from './workspace.model'

@Table({
  tableName: 'support_agents',
  timestamps: true,
  underscored: true,
})
export class SupportAgent extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @ForeignKey(() => require('./workspace.model').Workspace)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'workspace_id',
  })
  declare workspaceId: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'name',
  })
  declare name: string

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'instructions',
  })
  declare instructions: string | null

  @AllowNull(true)
  @Column({
    type: DataType.JSONB,
    field: 'branding',
  })
  declare branding: Record<string, any> | null

  @AllowNull(true)
  @Column({
    type: DataType.JSONB,
    field: 'knowledge_scope',
  })
  declare knowledgeScope: Record<string, any> | null

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_public',
  })
  declare isPublic: boolean

  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'public_key',
    unique: true
  })
  declare publicKey: string

  @AllowNull(false)
  @Default([])
  @Column({
    type: DataType.JSONB,
    field: 'allowed_origins',
  })
  declare allowedOrigins: string[]

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date

  @BelongsTo(() => require('./workspace.model').Workspace, 'workspaceId')
  declare workspace: WorkspaceType
}

export default SupportAgent
