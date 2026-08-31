import { Router } from 'express';
import * as recurringController from '../controllers/recurringController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createRecurringSchema, updateRecurringSchema } from '../validators/recurringValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/', recurringController.getRecurring);
router.post('/', validateRequest(createRecurringSchema), recurringController.createRecurring);
router.put('/:id', validateRequest(updateRecurringSchema), recurringController.updateRecurring);
router.delete('/:id', recurringController.deleteRecurring);

export default router;
