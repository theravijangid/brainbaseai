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
  Unique,
} from 'sequelize-typescript'
import { User } from './user.model'
import { Workspace } from './workspace.model'
import { Subscription } from './subscription.model'

@Table({
  tableName: 'companies',
  timestamps: true,
  underscored: true,
})
export class Company extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @ForeignKey(() => User)
  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.UUID,
    field: 'owner_user_id',
  })
  declare ownerUserId: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'name',
  })
  declare name: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'website',
  })
  declare website?: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'industry',
  })
  declare industry?: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'company_size',
  })
  declare companySize?: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'country',
  })
  declare country?: string

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'description',
  })
  declare description?: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'support_email',
  })
  declare supportEmail?: string

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

  @BelongsTo(() => User, 'ownerUserId')
  declare owner: User

  @HasMany(() => Workspace, 'companyId')
  declare workspaces: Workspace[]

  @HasMany(() => Subscription, 'companyId')
  declare subscriptions: Subscription[]
}

export default Company
