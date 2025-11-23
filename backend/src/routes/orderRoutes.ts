import { Router } from 'express';
import {
  getOrders,
  getOrderByTable,
  createOrder,
  cancelOrderItem,
  cancelOrder,
  // applyDiscount,
  // completeOrder,
} from '../controllers/orderController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';

const router = Router();

// All order routes are protected
router.use(authMiddleware);

router.route('/').get(getOrders).post(createOrder);

router.route('/by-table/:uuid').get(getOrderByTable);

router
  .route('/items/:itemId/cancel')
  .put(authorize('SUPERADMIN', 'MANAGER', 'OWNER'), cancelOrderItem);

router.route('/:id/cancel').put(authorize('SUPERADMIN', 'MANAGER', 'OWNER'), cancelOrder);

export default router;
