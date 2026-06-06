import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', contactController.getCompanies);
router.get('/:id', contactController.getCompany);
router.post('/', contactController.createCompany);
router.patch('/:id', contactController.updateCompany);
router.delete('/:id', contactController.deleteCompany);

export default router;
