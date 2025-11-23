import { Router } from 'express';
import { getTablesLayout } from '../controllers/tableController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// All table routes are protected
router.use(authMiddleware);

router.route('/').get(getTablesLayout);

export default router;
