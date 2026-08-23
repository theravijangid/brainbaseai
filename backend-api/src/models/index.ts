import { Sequelize } from 'sequelize-typescript'
import { User } from './user.model'
import { Workspace } from './workspace.model'
import { Source } from './source.model'
import { Conversation } from './conversation.model'
import { Message } from './message.model'
import { Company } from './company.model'
import { Plan } from './plan.model'
import { PlanPrice } from './plan-price.model'
import { Subscription } from './subscription.model'
import { Usage } from './usage.model'
import { WebhookEvent } from './webhook-event.model'
import { SupportAgent } from './support-agent.model'

export { User, Workspace, Source, Conversation, Message, Company, Plan, PlanPrice, Subscription, Usage, WebhookEvent, SupportAgent }

const models = [User, Workspace, Source, Conversation, Message, Company, Plan, PlanPrice, Subscription, Usage, WebhookEvent, SupportAgent]


export const initModels = (sequelize: Sequelize): void => {
  sequelize.addModels(models)
}
