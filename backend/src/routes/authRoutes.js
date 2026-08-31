import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
