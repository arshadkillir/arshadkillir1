import prisma from '../prismaClient.js';

export const getInventory = async (req, res) => {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(inventoryItems);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const searchInventory = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 10, // Limit results for performance
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Inventory search failed.' });
  }
};

// Placeholder for creating a purchase order
export const createPurchase = (req, res) => {
  res.status(501).json({ message: 'Create purchase endpoint not implemented.' });
};

export const adjustStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || isNaN(Number(quantity))) {
    return res.status(400).json({ error: 'A valid quantity is required.' });
  }

  try {
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: Number(id) },
      data: { qtyOnHand: Number(quantity) },
    });
    res.json(updatedItem);
  } catch (error) {
    console.error(`Failed to adjust stock for item ${id}:`, error);
    res.status(500).json({ error: 'Failed to adjust stock.' });
  }
};