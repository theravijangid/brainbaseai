import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'
import { PlanPrice } from './plan-price.model'

@Table({
  tableName: 'plans',
  timestamps: true,
  underscored: true,
})
export class Plan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  declare id: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'name',
  })
  declare name: string

  @AllowNull(false)
  @Default({})
  @Column({
    type: DataType.JSONB,
    field: 'metadata',
  })
  declare metadata: Record<string, any>

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

  @HasMany(() => PlanPrice, 'planId')
  declare prices: PlanPrice[]
}

export default Plan
