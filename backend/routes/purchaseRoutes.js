import { Router } from 'express';
import prisma from '../prismaClient.js';

const router = Router();

// GET /api/purchases
// Fetches all purchase orders
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases.' });
  }
});

// POST /api/purchases
// Creates a new purchase order and updates inventory
router.post('/', async (req, res) => {
  const { outletId, supplier, note, items } = req.body;

  if (!outletId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Outlet ID and at least one item are required.' });
  }

  try {
    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const newPurchase = await prisma.$transaction(async (tx) => {
      // 1. Create the Purchase record
      const purchase = await tx.purchase.create({
        data: {
          outletId,
          supplier,
          note,
          total,
          items: { create: items },
        },
        include: { items: true },
      });

      // 2. Update inventory levels for each item in the purchase
      for (const item of items) {
        await tx.inventoryItem.updateMany({ where: { name: item.name, outletId }, data: { qtyOnHand: { increment: item.quantity } } });
      }

      return purchase;
    });

    res.status(201).json(newPurchase);
  } catch (error) {
    console.error('Failed to create purchase:', error);
    res.status(500).json({ error: 'Failed to create purchase.' });
  }
});

export default router;