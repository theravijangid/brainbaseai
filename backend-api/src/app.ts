import compression from 'compression'
import cors from 'cors'
import express, { Express, json, NextFunction, Request, Response, urlencoded } from 'express'
import { errorHandler } from './middleware/error.middleware'
import morgan from 'morgan'
import helmet from 'helmet'
import workspaceRouter from './routes/workspace.route'
import sourceRouter from './routes/source.route'
import inngestRouter from './routes/inngest.route'
import chatRouter from './routes/chat.route'
import companyRouter from './routes/company.route'
import supportAgentRouter from './routes/support-agent.route'
import widgetRouter from './routes/widget.route'
import { clerkMiddleware } from '@clerk/express'

import webhookRouter from './routes/webhook.route'
import { requestLogger } from './middleware/logger.middleware'

const app: Express = express()

app.use(
  morgan(() => null)
)

// Middleware
let corsOptions = {
  origin: '*',
}

app.use(cors(corsOptions))

app.use(helmet())
app.use(compression({
  filter: (req: Request, res: Response) => {
    if (req.path.includes('/chat')) {
      return false;
    }
    return compression.filter(req, res);
  }
}))

// Mount webhook routes BEFORE json parsing
app.use('/api/v1/webhooks', webhookRouter)

app.use(json({ limit: '500kb' }))
app.use(urlencoded({ extended: true }))
app.use(clerkMiddleware())

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('BrainbaseAI Backend API')
})

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BrainbaseAI Backend API',
  })
})

app.use('/api/v1/companies', companyRouter)
app.use('/api/v1/workspaces', workspaceRouter)
app.use('/api/v1/workspaces/:workspaceId/sources', sourceRouter)
app.use('/api/v1/workspaces/:workspaceId/chat', chatRouter)
app.use('/api/v1/workspaces/:workspaceId/agents', supportAgentRouter)
app.use('/api/v1/workspaces/:workspaceId/conversations', require('./routes/conversation.route').default)
app.use('/api/v1/billing', require('./routes/billing.route').default)
app.use('/api/v1/widget', widgetRouter)
app.use('/api/inngest', inngestRouter)

// 404 handler
app.use((req: Request, res: Response, _: NextFunction) => {
  res.status(404).json({ message: 'Not Found' })
})

app.use(errorHandler)

// Error handler
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  res.status(500).json({ message: 'Internal Server Error' })
})

export default app
