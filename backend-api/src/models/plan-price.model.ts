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
import { Plan } from './plan.model'

@Table({
  tableName: 'plan_prices',
  timestamps: true,
  underscored: true,
})
export class PlanPrice extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @ForeignKey(() => Plan)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'plan_id',
  })
  declare planId: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'currency',
  })
  declare currency: string

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'amount',
  })
  declare amount: number 

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'interval', // e.g., 'month', 'year'
  })
  declare interval: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'provider',
  })
  declare provider: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'provider_price_id',
  })
  declare providerPriceId: string

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

  @BelongsTo(() => Plan, 'planId')
  declare plan: Plan
}

export default PlanPrice
