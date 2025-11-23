import { Router } from 'express';
import prisma from '../prismaClient.js';

const router = Router();

// GET /api/customers/search?phone=<phone_number>
// Searches for a customer by phone number and returns their details and order history.
router.get('/search', async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: 'A phone number is required for search.' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: true } },
        user: true,
      },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: 'No customer found with this phone number.' });
    }

    // Extract customer details from the most recent order
    const customerInfo = {
      name: orders[0].customerName,
      phone: orders[0].customerPhone,
    };

    res.json({ customer: customerInfo, orders });
  } catch (error) {
    console.error(`Failed to search for customer with phone ${phone}:`, error);
    res.status(500).json({ error: 'Failed to perform customer search.' });
  }
});

export default router;