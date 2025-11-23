import prisma from '../prismaClient.js';
import { subDays } from 'date-fns';

export const getSalesReport = async (req, res) => {
  try {
    // Get date range from query params, or default to the last 30 days
    const { startDate: startDateQuery, endDate: endDateQuery } = req.query;

    const endDate = endDateQuery ? new Date(endDateQuery) : new Date();
    // Set end of day for correct range
    endDate.setHours(23, 59, 59, 999);
    const startDate = startDateQuery ? new Date(startDateQuery) : subDays(endDate, 30);

    // 1. Aggregate total sales revenue
    const totalSalesData = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 2. Aggregate total purchase cost
    const totalPurchasesData = await prisma.purchase.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 2. Get sales data grouped by day for a chart
    // Using a raw query for date truncation, which is more efficient
    const salesByDay = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt")::DATE as date, SUM(total) as total
      FROM "orders"
      WHERE status = 'COMPLETED' AND "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC;
    `;

    // 3. Get top 5 selling menu items
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      where: {
        order: {
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Fetch names for the top items
    const itemIds = topItems.map(item => item.menuItemId);
    const itemDetails = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true },
    });
    const itemMap = new Map(itemDetails.map(item => [item.id, item.name]));

    const topSellingItems = topItems.map(item => ({
      name: itemMap.get(item.menuItemId) || 'Unknown Item',
      quantity: item._sum.quantity,
    }));

    // 4. Get sales by staff
    const salesByStaffData = await prisma.order.groupBy({
      by: ['userId'],
      _sum: { total: true },
      _count: { id: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const staffIds = salesByStaffData.map(s => s.userId);
    const staffDetails = await prisma.user.findMany({
      where: { id: { in: staffIds } },
      select: { id: true, name: true },
    });
    const staffMap = new Map(staffDetails.map(s => [s.id, s.name]));

    const salesByStaff = salesByStaffData.map(s => ({
      staffName: staffMap.get(s.userId) || 'Unknown Staff',
      totalSales: s._sum.total,
      orderCount: s._count.id,
    }));

    const totalSales = totalSalesData._sum.total || 0;
    const totalPurchases = totalPurchasesData._sum.total || 0;

    // 6. Get top customers by sales
    const topCustomersData = await prisma.order.groupBy({
      by: ['customerPhone', 'customerName'],
      _sum: { total: true },
      _count: { id: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
        customerPhone: { not: null },
      },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const topCustomers = topCustomersData.map(c => ({
      name: c.customerName,
      phone: c.customerPhone,
      totalSpent: c._sum.total,
      orderCount: c._count.id,
    }));

    // 5. Get sales by table
    const salesByTableData = await prisma.order.groupBy({
      by: ['tableId'],
      _sum: { total: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
        tableId: { not: null },
      },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const tableIds = salesByTableData.map(t => t.tableId);
    const tableDetails = await prisma.table.findMany({
      where: { id: { in: tableIds } },
      select: { id: true, name: true },
    });
    const tableMap = new Map(tableDetails.map(t => [t.id, t.name]));

    const salesByTable = salesByTableData.map(t => ({
      tableName: tableMap.get(t.tableId) || 'Unknown Table',
      totalSales: t._sum.total,
    }));

    // 5. Get sales by order type
    const salesByType = await prisma.order.groupBy({
      by: ['type'],
      _sum: { total: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 7. Get low stock items
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        qtyOnHand: {
          lt: prisma.inventoryItem.fields.minLevel,
        },
      },
      orderBy: { qtyOnHand: 'asc' },
    });

    // 8. Calculate total inventory value using a raw query for efficiency
    const inventoryValueResult = await prisma.$queryRaw`
      SELECT SUM("qtyOnHand" * cost) as value FROM "inventory_items"
    `;
    const inventoryValue = inventoryValueResult[0]?.value || 0;

    res.json({
      totalSales,
      totalPurchases,
      grossProfit: totalSales - totalPurchases,
      salesByDay,
      topSellingItems,
      salesByStaff,
      salesByTable,
      topCustomers,
      lowStockItems,
      inventoryValue,
      salesByType,
    });
  } catch (error) {
    console.error('Failed to generate sales report:', error);
    res.status(500).json({ error: 'Failed to generate sales report.' });
  }
};