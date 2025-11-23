// prisma-middleware.js
function attachTenantMiddleware(prisma, getContext) {
  const tenantScoped = new Set([
    "Order","OrderItem","MenuTemplate","Category","MenuItem",
    "Outlet","OutletInventory","OutletMenuItem","Customer","Shift","TenantSetting","User"
  ]);

  prisma.$use(async (params, next) => {
    const ctx = getContext();
    if (!ctx || !ctx.tenantId) return next(params);
    if (!params.model || !tenantScoped.has(params.model)) return next(params);

    // creates
    if (params.action === "create") {
      params.args = params.args || {};
      params.args.data = params.args.data || {};
      if (params.args.data.tenantId === undefined) params.args.data.tenantId = ctx.tenantId;
      return next(params);
    }
    if (params.action === "createMany") {
      params.args = params.args || {};
      params.args.data = params.args.data || [];
      params.args.data = params.args.data.map(d => ({ tenantId: ctx.tenantId, ...d }));
      return next(params);
    }

    // reads
    if (["findMany","findFirst","findUnique"].includes(params.action)) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      params.args.where = { AND: [params.args.where, { tenantId: ctx.tenantId }] };
      return next(params);
    }

    // updates/deletes
    if (["update","updateMany","delete","deleteMany","upsert"].includes(params.action)) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      params.args.where = { AND: [params.args.where, { tenantId: ctx.tenantId }] };
      return next(params);
    }

    return next(params);
  });
}

module.exports = { attachTenantMiddleware };
