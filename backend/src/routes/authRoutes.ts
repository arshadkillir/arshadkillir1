import { Router } from 'express';
import {
  login,
  registerTenant,
  getSubscriptionPlans,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.ts';

const router = Router();

router.post('/login', login);
router.post('/register', registerTenant);
router.get('/plans', getSubscriptionPlans);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
