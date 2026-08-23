import { Router } from 'express';
import billingController from '../controllers/billing.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/plans', billingController.getPlans.bind(billingController));
router.get('/subscription', billingController.getSubscription.bind(billingController));
router.post('/checkout', billingController.createCheckoutSession.bind(billingController));
router.post('/verify-payment', billingController.verifyPayment.bind(billingController));

export default router;
