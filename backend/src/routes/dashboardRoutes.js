import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', dashboardController.getDashboardSummary);

export default router;
