// app.js
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

// Local module imports
const prisma = require("./prismaClient"); // Use the new extended client
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's actual origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) return next();

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = {
      userId: decoded.sub,
      tenantId: decoded.tenantId,
      outletId: decoded.outletId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.use(authMiddleware);

// ------------------------- ROUTES -------------------------

// ROOT
app.get("/", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "dev" });
});

// FAVICON (ignore logs)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// DOCKER HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// HEALTH CHECK
app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false });
  }
});

// CURRENT USER
app.get("/me", async (req, res) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
  });

  res.json({ user });
});

// ------------------------- LOGIN -------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/login", async (req, res) => {
  const data = loginSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password } = data.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const payload = {
    sub: user.id,
    tenantId: user.tenantId,
    outletId: user.outletId,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
});

// ------------------------- REGISTER -------------------------
const registerUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "OWNER", "MANAGER", "STAFF"]).default("STAFF"),
});

app.post("/register", async (req, res) => {
  if (!req.auth || !["OWNER", "MANAGER", "SUPERADMIN"].includes(req.auth.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const data = registerUserSchema.safeParse(req.body);
  if (!data.success) return res.status(400).json(data.error);

  const { name, email, password, role } = data.data;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        tenantId: req.auth.tenantId,
        outletId: req.auth.outletId,
      },
    });

    delete user.password;

    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// ------------------------- CREATE ORDER -------------------------
const createOrderSchema = z.object({
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  customerName: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().positive(),
      })
    )
    .min(1),
});

app.post("/orders", async (req, res) => {
  // Get the context for this specific request from AsyncLocalStorage.
  if (!req.auth?.tenantId) return res.status(403).json({ error: "Tenant missing" });

  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { type, customerName, items } = parsed.data;

  const menuItemIds = items.map((i) => i.menuItemId);

  // Fetch allowed menu items
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  if (menuItems.length !== items.length) {
    return res.status(400).json({ error: "Invalid menu items" });
  }

  const orderItems = items.map((i) => {
    const item = menuItems.find((m) => m.id === i.menuItemId);
    return {
      menuItemId: item.id,
      quantity: i.quantity,
      price: item.price,
    };
  });

  const subtotal = orderItems.reduce((t, i) => t + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      // tenantId is now automatically added by the Prisma middleware.
      outletId: req.auth.outletId, // We still need to provide outletId explicitly if needed.
      type,
      customerName,
      subtotal,
      finalTotal: subtotal,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  res.status(201).json(order);
});

// ------------------------- ROUTE LOGGER -------------------------
function listRoutes() {
  const routeList = [];

  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(",");
      routeList.push(`${methods} ${layer.route.path}`);
    }
  });

  console.log("Registered routes:");
  console.log(routeList.join("\n"));
}

setTimeout(listRoutes, 300);

module.exports = app;
