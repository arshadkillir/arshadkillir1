import { Router } from 'express';
import { syncData } from '../controllers/syncController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// All sync routes are protected
router.use(authMiddleware);

router.route('/').post(syncData);

export default router;
