import { Router } from 'express';
import * as incomeController from '../controllers/incomeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createIncomeSchema, updateIncomeSchema } from '../validators/incomeValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/', incomeController.getAllIncomes);
router.post('/', validateRequest(createIncomeSchema), incomeController.createIncome);
router.get('/:id', incomeController.getIncome);
router.put('/:id', validateRequest(updateIncomeSchema), incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

export default router;
