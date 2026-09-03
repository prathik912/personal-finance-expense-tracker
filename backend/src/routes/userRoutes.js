import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { profileSchema } from '../validators/userValidator.js';

const router = Router();

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest(profileSchema), userController.updateProfile);
router.delete('/account', userController.deleteAccount);

export default router;
