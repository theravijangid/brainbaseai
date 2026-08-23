import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    // Don't log full bodies for chat/widget endpoints to avoid sensitive data leak
    logger.info('HTTP Request', {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      // requestBody: (req.path.includes('/chat') || req.path.includes('/widget')) ? undefined : req.body, 
    })
  })

  next()
}
