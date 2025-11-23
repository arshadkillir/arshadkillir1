import { Router } from 'express';
import {
  getTables,
  updateTable,
  mergeTables,
  splitTables,
  moveOrder,
  quickPay,
} from '../controllers/tableController.js';

const router = Router();

router.get('/', getTables);
router.put('/:id', updateTable);
router.post('/merge', mergeTables);
router.post('/split', splitTables);
router.post('/move', moveOrder);
router.post('/pay', quickPay);

export default router;