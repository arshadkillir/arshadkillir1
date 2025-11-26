const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require("zod");
const { signToken } = require("../utils/jwt");

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });

  const { email, password } = parsed.data;
  const prisma = req.prisma;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const payload = { sub: user.id, tenantId: user.tenantId, outletId: user.outletId, role: user.role };
  const token = signToken(payload);
  res.json({ token });
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "OWNER", "MANAGER", "STAFF"]).optional().default("STAFF")
});

// Register: must be created by OWNER / MANAGER / SUPERADMIN (or SUPERADMIN platform)
router.post("/register", async (req, res) => {
  if (!req.auth || !["OWNER", "MANAGER", "SUPERADMIN"].includes(req.auth.role)) {
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });

  const { name, email, password, role } = parsed.data;
  const prisma = req.prisma;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        tenantId: req.tenantId,
        outletId: req.outletId || undefined
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "Email already exists" });
    console.error("register error", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;