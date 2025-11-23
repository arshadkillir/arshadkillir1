import { Router } from 'express';
import { getAllUsers, updateUserRole, deactivateUser, reactivateUser, resetPassword } from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.put('/:id', updateUserRole);
router.delete('/:id', deactivateUser);
router.put('/:id/reactivate', reactivateUser);
router.put('/:id/reset-password', resetPassword);

export default router;