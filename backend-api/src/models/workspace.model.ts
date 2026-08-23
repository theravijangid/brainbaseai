import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'
import { User } from './user.model'
import { Company } from './company.model'
import { Source } from './source.model'
import type { Conversation as ConversationType } from './conversation.model'

@Table({
  tableName: 'workspaces',
  timestamps: true,
  underscored: true,
})
export class Workspace extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @ForeignKey(() => User)
  @AllowNull(true) 
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  declare userId?: string

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'company_id',
  })
  declare companyId: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'name',
  })
  declare name: string

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'description',
  })
  declare description?: string

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

  @BelongsTo(() => User, 'userId')
  declare user: User

  @BelongsTo(() => Company, 'companyId')
  declare company: Company

  @HasMany(() => Source, 'workspaceId')
  declare sources: Source[]

  @HasMany(() => require('./conversation.model').Conversation, 'workspaceId')
  declare conversations: ConversationType[]
}

export default Workspace
