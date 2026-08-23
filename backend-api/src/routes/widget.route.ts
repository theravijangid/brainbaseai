import { Router } from 'express';
import { WidgetController } from '../controllers/widget.controller';
import { authenticateWidgetJWT } from '../middleware/widget-auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const initLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 init requests per windowMs
  message: 'Too many initialization requests from this IP, please try again later.'
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 30, // limit each IP to 30 chat messages per minute
  message: 'Too many chat requests from this IP, please try again later.'
});

router.get('/origins/:publicKey', WidgetController.getOrigins);
router.post('/init', initLimiter, WidgetController.init);
router.post('/chat', chatLimiter, authenticateWidgetJWT, WidgetController.chat);

export default router;
