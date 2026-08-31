import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expenseValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/', expenseController.getAllExpenses);
router.post('/', validateRequest(createExpenseSchema), expenseController.createExpense);
router.get('/:id', expenseController.getExpense);
router.put('/:id', validateRequest(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;
