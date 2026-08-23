import { Request, Response } from 'express';
import { SupportAgentService } from '../services/support-agent.service';
import { SupportAgentChatService } from '../services/support-agent-chat.service';
import apiResponseHandlingClass from '../helpers/api-response-handling.class';
import { pipeUIMessageStreamToResponse, toUIMessageStream } from 'ai';
import { Message } from '../models/message.model';
import Logger from '../config/logger';

export class SupportAgentController {
  static async createAgent(req: Request, res: Response) {
    try {
      const companyId = req.company!.id;
      const { workspaceId } = req.params;
      const agent = await SupportAgentService.createAgent(companyId, workspaceId, req.body);
      return apiResponseHandlingClass.handleSuccessResponse(res, 'Agent created', agent);
    } catch (err: any) {
      if (err.message.startsWith('PLAN_LIMIT_REACHED')) {
        return apiResponseHandlingClass.handleForbiddenRequest(res, err.message);
      }
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }

  static async updateAgent(req: Request, res: Response) {
    try {
      const { workspaceId, agentId } = req.params;
      const agent = await SupportAgentService.updateAgent(agentId, workspaceId, req.body);
      return apiResponseHandlingClass.handleSuccessResponse(res, 'Agent updated', agent);
    } catch (err: any) {
      if (err.message?.includes('not found') || err.message?.includes('unauthorized')) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, err.message);
      }
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }

  static async getAgent(req: Request, res: Response) {
    try {
      const { workspaceId, agentId } = req.params;
      const agent = await SupportAgentService.getAgent(agentId, workspaceId);
      return apiResponseHandlingClass.handleSuccessResponse(res, 'Agent fetched', agent);
    } catch (err: any) {
      if (err.message?.includes('not found') || err.message?.includes('unauthorized')) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, err.message);
      }
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }

  static async listAgents(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const agents = await SupportAgentService.listAgents(workspaceId);
      return apiResponseHandlingClass.handleSuccessResponse(res, 'Agents fetched', agents);
    } catch (err: any) {
      return apiResponseHandlingClass.handleErrorReponse(res, err.message);
    }
  }

  static async chat(req: Request, res: Response) {
    try {
      const companyId = req.company!.id;
      const { workspaceId, agentId } = req.params;
      const { messages, conversationId } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return apiResponseHandlingClass.handleBadRequest(res, 'Messages array is required.');
      }

      const chatRes = await SupportAgentChatService.chat(
        companyId,
        workspaceId,
        agentId,
        messages,
        conversationId
      );

      if (chatRes.fallbackResponse) {
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'x-vercel-ai-data-stream': 'v1'
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
        pipeUIMessageStreamToResponse({
          response: res,
          stream: toUIMessageStream({
            stream: chatRes.result.stream,
            messageMetadata: () => undefined // Strip citations and metadata for public response
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
          } catch (dbErr) {
            Logger.error(`Failed to persist assistant message: ${dbErr}`);
          }
        }).catch((err: any) => {
          Logger.error(`Stream processing error for DB persistence: ${err}`);
        });
      }

    } catch (err: any) {
      Logger.error(`Support Agent Chat Controller Error: ${err.message}`);
      if (!res.headersSent) {
        if (err.message.startsWith('PLAN_LIMIT_REACHED')) {
          apiResponseHandlingClass.handleForbiddenRequest(res, err.message);
        } else {
          apiResponseHandlingClass.handleErrorReponse(res, err.message);
        }
      }
    }
  }
}
