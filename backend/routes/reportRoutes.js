import { Router } from 'express';
import { getSalesReport } from '../controllers/reportController.js';

const router = Router();

router.get('/sales', getSalesReport);

export default router;