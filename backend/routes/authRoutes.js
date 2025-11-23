import { Router } from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);

export default router;
