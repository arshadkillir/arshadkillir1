// c:\Users\DELL\Desktop\nandeyal pos\backend\prismaClient.js
const { PrismaClient } = require("@prisma/client");
const asyncLocalStorage = require('./context');

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

const tenantScopedModels = new Set([
  "Order", "OrderItem", "MenuTemplate", "Outlet", "OutletInventory",
  "OutletMenuItem", "Customer", "Shift", "TenantSetting", "User",
  "Floor", "MenuCategory", "MenuItem", "Ingredient", "Inventory",
  "JournalEntry", "DeliveryAggregatorConfig"
]);

const prismaWithTenant = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // If the model is not in our list of tenant-scoped models, do nothing.
        if (!tenantScopedModels.has(model)) {
          return query(args);
        }

        const context = asyncLocalStorage.getStore();
        const tenantId = context?.tenantId;

        // If there's no tenantId in the context, throw an error to prevent data leaks.
        if (!tenantId) {
          throw new Error(`Query for model '${model}' is missing tenant context.`);
        }

        // Modify the query arguments to enforce the tenantId
        if (operation === 'create') {
          args.data = { ...args.data, tenantId };
        } else if (operation === 'createMany') {
          args.data = args.data.map(item => ({ ...item, tenantId }));
        } else {
          // For find, update, delete, upsert, etc.
          args.where = { ...args.where, tenantId };
        }

        return query(args);
      },
    },
  },
});

module.exports = prismaWithTenant;