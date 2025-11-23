import { Router } from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
const router = Router();

// GET /api/orders
// Fetches all orders
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true, // Include the line items for each order
        user: true, // Include the user who created the order
        table: true, // Include the table associated with the order
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/by-table/:uuid
// Fetches the active order for a given table UUID.
router.get('/by-table/:uuid', async (req, res) => {
  const { uuid } = req.params;
  try {
    const table = await prisma.table.findUnique({
      where: { uuid },
      include: {
        orders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          include: {
            items: { include: { menuItem: true } }, // Include menu item details for the bill
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const activeOrder = table?.orders[0];
    res.json(activeOrder || null); // Return the order or null if no active order exists
  } catch (error) {
    console.error(`Failed to fetch order for table UUID ${uuid}:`, error);
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// POST /api/orders
// Creates a new order
router.post('/', async (req, res) => {
  const { type, outletId, userId, items, customerName, customerPhone, tableId } = req.body;

  // Basic validation
  if (!type || !outletId || !userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: type, outletId, userId, and items.' });
  }

  try {
    // 1. Get the prices for all menu items in the order
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
    });

    // Create a map for easy price lookup
    const priceMap = new Map(menuItems.map(item => [item.id, item.price]));

    // 2. Calculate the total price of the order
    const total = items.reduce((sum, item) => {
      const price = priceMap.get(item.menuItemId) || 0;
      return sum + (price * item.quantity);
    }, 0);

    // 3. Use a transaction to create the order and update the table status if applicable
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          type,
          outletId,
          userId,
          total,
          customerName,
          customerPhone,
          tableId: tableId ? Number(tableId) : null,
          items: { create: items }, // Nested write to create OrderItems
        },
        include: { items: true }, // Include the created items in the response
      });

      // If it's a dine-in order for a specific table, mark the table as occupied
      if (type === 'DINE_IN' && tableId) {
        await tx.table.update({ where: { id: Number(tableId) }, data: { status: 'OCCUPIED' } });
      }
      return order;
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/cancel
// Cancels an order after verifying an authorized user's password.
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const { userId, password, reason } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and password are required for authorization.' });
  }

  try {
    // 1. Find the authorizing user
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    // 2. Check if user exists, is a manager/admin, and if the password is correct
    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'User does not have authorization to cancel orders.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // 3. If authorized, update the order status
    const cancelledOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED', cancellationReason: reason },
    });

    res.json(cancelledOrder);
  } catch (error) {
    console.error(`Failed to cancel order ${id}:`, error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

// PUT /api/orders/items/:itemId/cancel
// Cancels a single item within an order.
router.put('/items/:itemId/cancel', async (req, res) => {
  const { itemId } = req.params;
  const { userId, password, reason } = req.body;

  if (!userId || !password || !reason) {
    return res.status(400).json({ error: 'User ID, password, and reason are required.' });
  }

  try {
    // 1. Find the authorizing user
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    // 2. Check if user exists, is a manager/admin, and if the password is correct
    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'User does not have authorization.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // 3. If authorized, update the order item status
    const cancelledItem = await prisma.orderItem.update({
      where: { id: Number(itemId) },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledById: user.id,
        cancelledAt: new Date(),
      },
    });

    res.json(cancelledItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order item.' });
  }
});

// PUT /api/orders/:id/discount
// Applies a discount to an order.
router.put('/:id/discount', async (req, res) => {
  const { id } = req.params;
  const { amount, percentage } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: Number(id) } });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    let newTotal = Number(order.total);
    let discountAmount = 0;
    let discountPercentage = 0;

    if (percentage && percentage > 0) {
      discountPercentage = Number(percentage);
      discountAmount = newTotal * (discountPercentage / 100);
      newTotal -= discountAmount;
    } else if (amount && amount > 0) {
      discountAmount = Number(amount);
      newTotal -= discountAmount;
      // Calculate percentage for record keeping
      discountPercentage = (discountAmount / Number(order.total)) * 100;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        total: newTotal,
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to apply discount to order ${id}:`, error);
    res.status(500).json({ error: 'Failed to apply discount.' });
  }
});

export default router;