import { Router } from 'express'
import { ChatController } from '../controllers/chat.controller'
import { requireAuth, requireWorkspaceAccess } from '../middleware/auth.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import validate from '../middleware/validator.middleware'
import { sendChatSchema } from '../validators/chat.validator'

const router = Router({ mergeParams: true })

router.use(apiLimiter)
router.use(requireAuth)
router.use(requireWorkspaceAccess)

router.post('/', validate(sendChatSchema), ChatController.sendChatMessage)
router.get('/:conversationId', ChatController.getConversation)

export default router
