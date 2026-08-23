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

@Table({
  tableName: 'usage_records',
  timestamps: true,
  underscored: true,
})
export class Usage extends Model {
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

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'metric', // 'knowledge_chat_messages' | 'support_agent_conversations'
  })
  declare metric: string

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'count',
  })
  declare count: number

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'period_start',
  })
  declare periodStart: Date

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'period_end',
  })
  declare periodEnd: Date

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
}

export default Usage
