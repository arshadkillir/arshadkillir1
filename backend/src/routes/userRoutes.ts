import { Router } from 'express';
import {
  getAllUsers,
  updateUser,
  updateUserStatus,
  resetPassword,
  getUserById,
  deleteUser,
} from '../controllers/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';

const router = Router();

// All user routes are protected and require at least a MANAGER role
router.use(authMiddleware, authorize('OWNER', 'MANAGER', 'SUPERADMIN'));

router.route('/').get(getAllUsers);

router.route('/:id').get(getUserById).put(updateUser).delete(authorize('OWNER', 'SUPERADMIN'), deleteUser);

router.route('/:id/status').put(updateUserStatus);

router.route('/:id/reset-password').put(resetPassword);

export default router;
