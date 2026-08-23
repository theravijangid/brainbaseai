import { Request, Response } from 'express';
import { z } from 'zod';
import { SupportAgent } from '../models/support-agent.model';
import { Workspace } from '../models/workspace.model';
import { Message } from '../models/message.model';
import { SupportAgentChatService } from '../services/support-agent-chat.service';
import entitlementService from '../services/entitlements/entitlement.service';
import apiResponseHandlingClass from '../helpers/api-response-handling.class';
import jwt from 'jsonwebtoken';
import { pipeUIMessageStreamToResponse, toUIMessageStream } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../config/logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function extractUUID(key?: string): string | null {
  if (!key || typeof key !== 'string') return null;
  let cleaned = key.trim();
  if (cleaned.startsWith('pk_live_')) {
    cleaned = cleaned.slice(8);
  } else if (cleaned.startsWith('bb_live_')) {
    cleaned = cleaned.slice(8);
  }
  return UUID_REGEX.test(cleaned) ? cleaned : null;
}

const initSchema = z.object({
  publicKey: z.string().min(1, 'Public key is required'),
  origin: z.string().optional()
});

const chatSchema = z.object({
  messages: z.array(z.any()).min(1),
  conversationId: z.string().optional(),
});

export class WidgetController {
  static async init(req: Request, res: Response) {
    try {
      const parsed = initSchema.parse(req.body);
      const rawPublicKey = extractUUID(parsed.publicKey);

      if (!rawPublicKey) {
        return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Invalid agent key format');
      }
      
      const agent = await SupportAgent.findOne({
        where: { publicKey: rawPublicKey, isPublic: true },
        include: [{ model: Workspace, as: 'workspace' }]
      });

      if (!agent) {
        return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Agent not found or inactive');
      }

      const origins: string[] = agent.allowedOrigins || [];
      const incomingOrigin = parsed.origin;

      if (origins.length > 0) {
        if (!incomingOrigin) {
          Logger.warn(`Widget init: Missing origin for validation on agent ${agent.id}`);
        } else {
          const isAllowed = origins.some(allowed => 
            incomingOrigin.startsWith(allowed) || allowed === '*'
          );

          if (!isAllowed) {
            Logger.warn(`Widget init: Origin mismatch. Incoming: ${incomingOrigin}, Allowed: ${origins.join(', ')}`);
            // NOT enforcing for MVP to avoid breaking local testing
            // return apiResponseHandlingClass.handleUnauthorizedRequest(res, 'Unauthorized embedding origin');
          }
        }
      }

      // Do NOT consume usage here.
      // Just issue the stateless session JWT.
      const sessionId = uuidv4();
      
      const payload = {
        agentId: agent.id,
        workspaceId: agent.workspaceId,
        companyId: agent.workspace.companyId,
        sessionId
      };

      const branding = {
        ...agent.branding,
        title: agent?.name,
        subtitle: 'Support Agent'
      }

      const secret = process.env.WIDGET_JWT_SECRET || 'default-widget-secret-key-change-me';
      const token = jwt.sign(payload, secret, { expiresIn: '24h' });

      return apiResponseHandlingClass.handleSuccessResponse(res, 'Widget initialized', { token, sessionId, branding });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return apiResponseHandlingClass.handleBadRequest(res, 'Validation error', err.issues);
      }
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }

  static async chat(req: Request, res: Response) {
    try {
      const parsed = chatSchema.parse(req.body);
      const session = req.widgetSession!;

      const chatRes = await SupportAgentChatService.chat(
        session.companyId,
        session.workspaceId,
        session.agentId,
        parsed.messages,
        parsed.conversationId
      );

      if (chatRes.fallbackResponse) {
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'x-vercel-ai-data-stream': 'v1',
          'x-conversation-id': chatRes.conversationId,
        });
        res.write(`0:"${chatRes.fallbackResponse}"\\n`);
        res.end();

        try {
          await Message.create({
            conversationId: chatRes.conversationId,
            role: 'assistant',
            content: chatRes.fallbackResponse,
            citations: {},
          });
        } catch (dbErr) {
          Logger.error(`Failed to persist fallback message: ${dbErr}`);
        }
        return;
      }

      if (chatRes.result) {
        res.setHeader('x-conversation-id', chatRes.conversationId);
        pipeUIMessageStreamToResponse({
          response: res,
          stream: toUIMessageStream({
            stream: chatRes.result.stream,
            messageMetadata: () => undefined
          })
        });

        chatRes.result.text.then(async (fullText: string) => {
          try {
            await Message.create({
              conversationId: chatRes.conversationId,
              role: 'assistant',
              content: fullText,
              citations: {},
            });
            Logger.info(`Persisted widget assistant message for conversation ${chatRes.conversationId}`);
          } catch (dbErr) {
            Logger.error(`Failed to persist widget assistant message: ${dbErr}`);
          }
        }).catch((err: any) => {
          Logger.error(`Widget stream text extraction error for DB persistence: ${err}`);
        });
      }

    } catch (err: any) {
      Logger.error(`Widget Chat Controller Error: ${err.message}`);
      if (!res.headersSent) {
        if (err.message.startsWith('PLAN_LIMIT_REACHED')) {
          apiResponseHandlingClass.handleForbiddenRequest(res, err.message);
        } else {
          apiResponseHandlingClass.handleErrorReponse(res, err.message);
        }
      }
    }
  }

  static async getOrigins(req: Request, res: Response) {
    try {
      const rawPublicKey = extractUUID(req.params.publicKey);
      if (!rawPublicKey) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, 'Agent not found');
      }

      const agent = await SupportAgent.findOne({
        where: { publicKey: rawPublicKey, isPublic: true },
        attributes: ['allowedOrigins']
      });

      if (!agent) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, 'Agent not found');
      }

      return apiResponseHandlingClass.handleSuccessResponse(res, 'Origins fetched', agent.allowedOrigins || []);
    } catch (err: any) {
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }
}
