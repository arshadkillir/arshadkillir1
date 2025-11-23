import { Router } from 'express';
import { getSalesReport } from '../controllers/reportController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';

const router = Router();

router.use(authMiddleware);

// Only authorized users can access reports
router.route('/sales').get(authorize('OWNER', 'MANAGER', 'SUPERADMIN'), getSalesReport);

export default router;
