import { Router } from 'express';
import { SupportAgentController } from '../controllers/support-agent.controller';
import { requireAuth, requireWorkspaceAccess } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.post('/', SupportAgentController.createAgent);
router.get('/', SupportAgentController.listAgents);
router.get('/:agentId', SupportAgentController.getAgent);
router.put('/:agentId', SupportAgentController.updateAgent);
router.post('/:agentId/chat', SupportAgentController.chat);

export default router;
