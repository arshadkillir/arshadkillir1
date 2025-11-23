// server.js
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { attachTenantMiddleware } = require('./prisma-middleware.cjs');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// simple request-scoped context holder
const requestContext = new WeakMap();
function setRequestContext(req, ctx) { requestContext.set(req, ctx); }
function getRequestContext(req) { return requestContext.get(req); }

// adapt attachTenantMiddleware to use getContext closure
attachTenantMiddleware(prisma, () => {
  // middleware will call this during a request cycle; ensure currentRequest is set
  // we store current request object in global variable below; this function must
  // return an object containing { tenantId, outletId, userId } or null.
  return global.__CURRENT_PRISMA_CTX || null;
});

// Auth middleware: verifies JWT and sets tenant/outlet/user on req
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next(); // allow anonymous where needed

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // expected payload shape: { sub: "<userId>", tenantId: "...", outletId: "...", role: "TENANT_ADMIN", exp: ... }
    req.auth = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      outletId: payload.outletId,
      role: payload.role
    };
    // expose for prisma middleware (simple approach)
    global.__CURRENT_PRISMA_CTX = {
      tenantId: req.auth.tenantId,
      outletId: req.auth.outletId,
      userId: req.auth.userId
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  } finally {
    // clear after response finished to avoid leakage between requests
    res.on("finish", () => { global.__CURRENT_PRISMA_CTX = null; });
  }
}

app.use(authMiddleware);

// Example protected route
app.get("/me", async (req, res) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }});
  res.json({ user });
});

// Example create order endpoint (tenant-scoped)
app.post("/orders", async (req, res) => {
  const ctx = global.__CURRENT_PRISMA_CTX;
  if (!ctx?.tenantId) return res.status(403).json({ error: "Tenant context missing" });

  const { items, type, customerName } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        tenantId: ctx.tenantId,
        outletId: ctx.outletId ?? undefined,
        type,
        subtotal: "0.00",
        finalTotal: "0.00",
        customerName,
        items: { create: items.map(it => ({
          menuItemId: it.menuItemId,
          quantity: it.quantity.toString(),
          unitPrice: it.unitPrice.toString()
        })) }
      },
      include: { items: true }
    });
    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));



