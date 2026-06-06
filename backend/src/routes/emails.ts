import { Router } from 'express';
import { emailController } from '../controllers/emailController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public tracking endpoints (no auth)
router.get('/track/:trackingId/open', emailController.trackOpen);
router.get('/track/:trackingId/click', emailController.trackClick);

// Authenticated endpoints
router.use(authenticate);
router.get('/stats', emailController.getEmailStats);
router.get('/', emailController.getEmailLogs);
router.post('/', emailController.logEmail);
router.delete('/:id', emailController.deleteEmailLog);

export default router;
