import { Router } from 'express';
import { getInventory, adjustStock, searchInventory } from '../controllers/inventoryController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// All inventory routes should be protected
router.use(authMiddleware);

router.route('/').get(getInventory);
router.route('/search').get(searchInventory);
router.route('/:id/adjust').put(adjustStock);

export default router;
