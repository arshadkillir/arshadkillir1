import { Router } from 'express';
import { getInventory, adjustStock, searchInventory } from '../controllers/inventoryController.js';

const router = Router();

router.get('/', getInventory);
router.get('/search', searchInventory);
router.put('/:id/adjust', adjustStock);

export default router;