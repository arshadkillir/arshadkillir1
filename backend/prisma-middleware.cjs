try {
  // attempt to require the actual middleware under middleware/
  module.exports = require('./middleware/prisma-middleware');
} catch (err) {
  // fallback no-op middleware so server boots while you fix/convert the real file
  module.exports = {
    attachTenantMiddleware(prisma, getContext) {
      prisma.$use(async (params, next) => next(params));
      console.log("[prisma-middleware shim] attached noop");
    }
  };
}
