import { Router } from 'express'
import companyController from '../controllers/company.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.post('/onboard', requireAuth, companyController.onboard.bind(companyController))
router.get('/me', requireAuth, companyController.getMe.bind(companyController))
router.put('/me', requireAuth, companyController.updateMe.bind(companyController))
router.get('/usage', requireAuth, companyController.getUsage.bind(companyController))

export default router
