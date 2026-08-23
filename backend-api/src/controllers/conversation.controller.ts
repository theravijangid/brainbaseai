import { Request, Response } from 'express';
import ConversationDAO from '../dao/conversation.dao';
import apiResponseHandlingClass from '../helpers/api-response-handling.class';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['open', 'resolved', 'attention']),
});

export class ConversationController {
  static async listConversations(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId;
      const statusFilter = req.query.status as string;
      const typeFilter = req.query.type as string;

      const conversations = await ConversationDAO.listConversations(workspaceId, statusFilter, typeFilter);
      return apiResponseHandlingClass.handleSuccessResponse(res, 'Conversations fetched successfully', conversations);
    } catch (error: any) {
      return apiResponseHandlingClass.handleErrorReponse(res, error.message);
    }
  }

  static async getConversationById(req: Request, res: Response) {
    try {
      const { workspaceId, id } = req.params;
      const conversation = await ConversationDAO.getConversationById(id, workspaceId);

      if (!conversation) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, 'Conversation not found');
      }

      return apiResponseHandlingClass.handleSuccessResponse(res, 'Conversation details fetched', conversation);
    } catch (error: any) {
      return apiResponseHandlingClass.handleErrorReponse(res, error.message);
    }
  }

  static async updateConversation(req: Request, res: Response) {
    try {
      const { workspaceId, id } = req.params;
      const parsed = updateStatusSchema.parse(req.body);

      const conversation = await ConversationDAO.updateConversationStatus(id, workspaceId, parsed.status);
      if (!conversation) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, 'Conversation not found');
      }

      return apiResponseHandlingClass.handleSuccessResponse(res, 'Conversation updated', conversation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return apiResponseHandlingClass.handleBadRequest(res, 'Validation error', error.issues);
      }
      return apiResponseHandlingClass.handleErrorReponse(res, error.message);
    }
  }

  static async deleteConversation(req: Request, res: Response) {
    try {
      const { workspaceId, id } = req.params;
      const deleted = await ConversationDAO.deleteConversation(id, workspaceId);
      
      if (!deleted) {
        return apiResponseHandlingClass.handleNotFoundRequest(res, 'Conversation not found');
      }

      return apiResponseHandlingClass.handleSuccessResponse(res, 'Conversation deleted');
    } catch (error: any) {
      return apiResponseHandlingClass.handleErrorReponse(res, error.message);
    }
  }
}

export default ConversationController;
