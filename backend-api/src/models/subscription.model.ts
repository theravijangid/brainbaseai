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
import { Company } from './company.model'
import { Plan } from './plan.model'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
})
export class Subscription extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'company_id',
  })
  declare companyId: string

  @ForeignKey(() => Plan)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'plan_id',
  })
  declare planId: string

  @AllowNull(false)
  @Default('none')
  @Column({
    type: DataType.STRING,
    field: 'provider', // e.g., 'razorpay', 'none'
  })
  declare provider: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'provider_customer_id',
  })
  declare providerCustomerId?: string

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'provider_subscription_id',
  })
  declare providerSubscriptionId?: string

  @AllowNull(false)
  @Default('active')
  @Column({
    type: DataType.STRING,
    field: 'status',
  })
  declare status: SubscriptionStatus

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'currency',
  })
  declare currency?: string

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    field: 'amount',
  })
  declare amount?: number

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'billing_interval',
  })
  declare billingInterval?: string

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'current_period_start',
  })
  declare currentPeriodStart?: Date

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'current_period_end',
  })
  declare currentPeriodEnd?: Date

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'cancel_at_period_end',
  })
  declare cancelAtPeriodEnd: boolean

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

  @BelongsTo(() => Company, 'companyId')
  declare company: Company

  @BelongsTo(() => Plan, 'planId')
  declare plan: Plan
}

export default Subscription
