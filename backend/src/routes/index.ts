import { Router } from 'express';

import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import orderRoutes from './orderRoutes';
import menuRoutes from './menuRoutes';
import outletRoutes from './outletRoutes';
import purchaseRoutes from './purchaseRoutes';
import reportRoutes from './reportRoutes';
import inventoryRoutes from './inventoryRoutes';
import tableRoutes from './tableRoutes';
import customerRoutes from './customerRoutes';
import syncRoutes from './syncRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/menu', menuRoutes);
router.use('/outlets', outletRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/reports', reportRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/tables', tableRoutes);
router.use('/customers', customerRoutes);
router.use('/sync', syncRoutes);

export default router;
