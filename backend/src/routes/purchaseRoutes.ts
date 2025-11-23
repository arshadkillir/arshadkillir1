import { Router } from 'express';
import {
  getPurchases,
  createPurchase,
} from '../controllers/purchaseController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';

const router = Router();

router.use(authMiddleware);

router.route('/').get(getPurchases).post(authorize('OWNER', 'MANAGER'), createPurchase);

export default router;
