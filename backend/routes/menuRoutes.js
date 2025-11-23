import { Router } from 'express';
import prisma from '../prismaClient.js';

const router = Router();

// GET /api/menu/items
// Fetches all menu items
router.get('/items', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(menuItems);
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

export default router;