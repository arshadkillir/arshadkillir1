import prisma from '../prismaClient.js';

// Placeholder controller.
// In a real application, you would implement the logic for managing tables,
// merging/splitting them, and handling payments.

export const getTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(tables);
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

export const updateTable = async (req, res) => {
  const { id } = req.params;
  const { status, waiterId, discount } = req.body;

  try {
    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: {
        status,
        discount,
        // Correct way to connect a relation in Prisma.
        // This checks if waiterId is provided before trying to connect.
        waiter: waiterId ? {
          connect: { id: Number(waiterId) }
        } : undefined,
      },
    });
    res.json(updatedTable);
  } catch (error) {
    // Log the specific error for better debugging
    console.error(`Failed to update table with id ${id}:`, error);
    res.status(500).json({ error: `Failed to update table ${id}` });
  }
};

export const mergeTables = async (req, res) => {
  const { tableIds, newName, outletId } = req.body;

  if (!tableIds || tableIds.length < 2 || !newName || !outletId) {
    return res.status(400).json({ error: 'Requires at least two tableIds, a newName, and an outletId.' });
  }

  try {
    const [mergedTable, ..._] = await prisma.$transaction([
      // 1. Create the new MergedTables record
      prisma.mergedTables.create({
        data: {
          name: newName,
          tableIds: tableIds,
          outletId: outletId,
        },
      }),
      // 2. Update the status of all original tables to 'MERGED'
      prisma.table.updateMany({
        where: { id: { in: tableIds } },
        data: { status: 'MERGED' },
      }),
    ]);
    res.status(201).json(mergedTable);
  } catch (error) {
    console.error('Failed to merge tables:', error);
    res.status(500).json({ error: 'Failed to merge tables' });
  }
};

export const splitTables = async (req, res) => {
  const { mergedTableId } = req.body;

  if (!mergedTableId) {
    return res.status(400).json({ error: 'mergedTableId is required.' });
  }

  try {
    // Find the merged table record to get the original table IDs
    const mergedTable = await prisma.mergedTables.findUnique({
      where: { id: Number(mergedTableId) },
    });

    if (!mergedTable) {
      return res.status(404).json({ error: 'Merged table not found.' });
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
      // 1. Update the original tables back to 'FREE'
      prisma.table.updateMany({ where: { id: { in: mergedTable.tableIds } }, data: { status: 'FREE' } }),
      // 2. Delete the MergedTables record
      prisma.mergedTables.delete({ where: { id: Number(mergedTableId) } }),
    ]);

    res.status(200).json({ message: 'Tables split successfully.' });
  } catch (error) {
    console.error('Failed to split tables:', error);
    res.status(500).json({ error: 'Failed to split tables' });
  }
};

export const moveOrder = async (req, res) => {
  const { orderId, fromTableId, toTableId } = req.body;

  if (!orderId || !fromTableId || !toTableId) {
    return res.status(400).json({ error: 'orderId, fromTableId, and toTableId are required.' });
  }

  if (fromTableId === toTableId) {
    return res.status(400).json({ error: 'Source and destination tables cannot be the same.' });
  }

  try {
    // Use an interactive transaction to ensure all steps succeed or none do.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify the order exists on the source table
      const order = await tx.order.findFirst({
        where: { id: Number(orderId), tableId: Number(fromTableId) },
      });

      if (!order) {
        throw new Error('Order not found on the specified source table.');
      }

      // 2. Atomically perform the updates
      await tx.table.update({ where: { id: Number(fromTableId) }, data: { status: 'FREE' } });
      await tx.table.update({ where: { id: Number(toTableId) }, data: { status: 'OCCUPIED' } });
      return tx.order.update({ where: { id: Number(orderId) }, data: { tableId: Number(toTableId) } });
    });

    res.status(200).json({ message: 'Order moved successfully.', order: result });
  } catch (error) {
    console.error('Failed to move order:', error);
    res.status(500).json({ error: error.message || 'Failed to move order' });
  }
};

export const quickPay = async (req, res) => {
  const { tableId } = req.body;

  if (!tableId) {
    return res.status(400).json({ error: 'tableId is required.' });
  }

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Find the active order for the given table
      const order = await tx.order.findFirst({
        where: {
          tableId: Number(tableId),
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      });

      if (!order) {
        throw new Error(`No active order found for table ${tableId}.`);
      }

      // 2. Update the table status to 'FREE'
      await tx.table.update({ where: { id: Number(tableId) }, data: { status: 'FREE' } });

      // 3. Update the order status to 'COMPLETED' and return it
      return tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
    });

    res.status(200).json({ message: 'Payment completed successfully.', order: updatedOrder });
  } catch (error) {
    console.error('Quick pay failed:', error);
    res.status(500).json({ error: error.message || 'Quick pay failed' });
  }
};