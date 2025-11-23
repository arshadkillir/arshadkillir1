import { Router } from 'express';
import { getCustomers } from '../controllers/customerController.ts';

const router = Router();

router.get('/', getCustomers);

export default router;
