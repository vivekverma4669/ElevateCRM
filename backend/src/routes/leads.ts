import { Router } from 'express';
import { leadController } from '../controllers/leadController';
import { activityController } from '../controllers/activityController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema } from '../validations/leadValidation';

const router = Router();

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/kanban', leadController.getKanbanLeads);
router.get('/:id', leadController.getLead);
router.post('/', validate(createLeadSchema), leadController.createLead);
router.patch('/:id', validate(updateLeadSchema), leadController.updateLead);
router.patch('/:id/status', leadController.updateLeadStatus);
router.delete('/:id', leadController.deleteLead);

// Lead activities and notes
router.get('/:leadId/activities', activityController.getLeadActivities);
router.get('/:leadId/notes', activityController.getLeadNotes);
router.post('/:leadId/notes', activityController.createNote);
router.patch('/:leadId/notes/:noteId', activityController.updateNote);
router.delete('/:leadId/notes/:noteId', activityController.deleteNote);

export default router;
