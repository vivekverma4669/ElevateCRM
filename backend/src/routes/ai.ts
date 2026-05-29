import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../redis/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.post('/summarize', aiController.summarizeLead);
router.post('/email', aiController.generateEmail);
router.get('/insights', aiController.getSalesInsights);
router.post('/chat', aiController.chat);

export default router;
