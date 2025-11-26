const prisma = require("../../prismaClient");
const { verifyToken } = require("../utils/jwt");

/**
 * Simple request middleware: verifies token and attaches auth info, prisma client,
 * and tenant/outlet IDs to the request object.
 */
module.exports = function authMiddleware() {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.auth = verifyToken(token);
    }
    req.prisma = prisma;
    req.tenantId = req.auth?.tenantId;
    req.outletId = req.auth?.outletId;
    next();
  };
};