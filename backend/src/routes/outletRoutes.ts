import { Router } from 'express';
import {
  getOutlets,
  addOutlet,
  updateOutlet,
  deleteOutlet,
} from '../controllers/outletController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';

const router = Router();

// All outlet routes are protected
router.use(authMiddleware);

router.route('/').get(getOutlets).post(authorize('OWNER', 'MANAGER'), addOutlet);

router.route('/:id').put(authorize('OWNER', 'MANAGER'), updateOutlet).delete(authorize('OWNER'), deleteOutlet);

export default router;
