import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { requireAuth, requireWorkspaceAccess } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', ConversationController.listConversations);
router.get('/:id', ConversationController.getConversationById);
router.put('/:id', ConversationController.updateConversation);
router.delete('/:id', ConversationController.deleteConversation);

export default router;
