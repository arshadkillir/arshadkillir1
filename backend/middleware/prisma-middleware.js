const asyncLocalStorage = require('../context');

/**
 * Attaches Prisma middleware to enforce multi-tenancy rules automatically.
 * It reads the tenantId from the AsyncLocalStorage context for each query.
 */
function attachTenantMiddleware() {
  const prisma = require('../prisma'); // LAZY LOAD: Import prisma inside the function to break circular dependencies.
  // Define which models are tenant-scoped
  const tenantScopedModels = new Set([
    "Order", "OrderItem", "MenuTemplate", "Outlet", "OutletInventory",
    "OutletMenuItem", "Customer", "Shift", "TenantSetting", "User",
    "Floor", "MenuCategory", "MenuItem", "Ingredient", "Inventory",
    "JournalEntry", "DeliveryAggregatorConfig"
  ]);

  prisma.$use(async (params, next) => {
    const context = asyncLocalStorage.getStore();
    const tenantId = context?.tenantId;

    // If there's no tenantId in the context or the model isn't tenant-scoped, proceed without modification.
    if (!tenantId || !params.model || !tenantScopedModels.has(params.model)) {
      return next(params);
    }

    // Modify the query arguments to enforce the tenantId
    const actions = ["findUnique", "findFirst", "findMany", "update", "updateMany", "delete", "deleteMany", "upsert", "count", "aggregate", "groupBy"];

    if (actions.includes(params.action)) {
      params.args = params.args || {};
      params.args.where = { ...params.args.where, tenantId };
    } else if (params.action === "create") {
      params.args = params.args || {};
      params.args.data = { ...params.args.data, tenantId };
    } else if (params.action === "createMany") {
      params.args.data = params.args.data.map(item => ({ ...item, tenantId }));
    }

    return next(params);
  });
}

module.exports = attachTenantMiddleware; // Export the function directly
