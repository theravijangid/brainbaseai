import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import apiResponseHandlingClass from '../helpers/api-response-handling.class';
import Logger from '../config/logger';

export interface WidgetSessionPayload {
  agentId: string;
  workspaceId: string;
  companyId: string;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      widgetSession?: WidgetSessionPayload;
    }
  }
}

export const authenticateWidgetJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.WIDGET_JWT_SECRET || 'default-widget-secret-key-change-me';

    const decoded = jwt.verify(token, secret) as WidgetSessionPayload;
    
    if (!decoded.agentId || !decoded.workspaceId || !decoded.companyId || !decoded.sessionId) {
      return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Invalid widget session payload');
    }

    req.widgetSession = decoded;
    next();
  } catch (err: any) {
    Logger.error(`Widget JWT verification failed: ${err.message}`);
    return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Invalid or expired widget session');
  }
};
