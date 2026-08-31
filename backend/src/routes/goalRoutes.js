import { Router } from 'express';
import * as goalController from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goalValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/', goalController.getGoals);
router.post('/', validateRequest(createGoalSchema), goalController.createGoal);
router.get('/:id', goalController.getGoal);
router.put('/:id', validateRequest(updateGoalSchema), goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

export default router;
