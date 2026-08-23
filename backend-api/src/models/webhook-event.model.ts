import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'

export type WebhookEventStatus = 'PROCESSED' | 'FAILED'

@Table({
  tableName: 'webhook_events',
  timestamps: true,
  underscored: true,
})
export class WebhookEvent extends Model {
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
    field: 'provider',
  })
  declare provider: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'event_id',
  })
  declare eventId: string

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'event_type',
  })
  declare eventType: string

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('PROCESSED', 'FAILED'),
    field: 'status',
  })
  declare status: WebhookEventStatus

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'failure_reason',
  })
  declare failureReason?: string

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
}

export default WebhookEvent
