import { Router } from 'express';
import * as budgetController from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createCategorySchema } from '../validators/budgetValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/categories', budgetController.getBudgetCategories);
router.post('/categories', validateRequest(createCategorySchema), budgetController.createBudgetCategory);
router.get('/adjustments', budgetController.getBudgetAdjustments);

export default router;
