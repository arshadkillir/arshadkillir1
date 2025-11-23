import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorize } from '../middleware/authorize.ts';
import * as Menu from '../controllers/menuController.ts';

// Setup multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Apply the 'authMiddleware' middleware to all routes in this file
router.use(authMiddleware);

router.route('/').get(Menu.getMenu);
router
  .route('/upload')
  .post(authorize('SUPERADMIN', 'MANAGER'), upload.single('menuCsv'), Menu.uploadMenu);

export default router;
