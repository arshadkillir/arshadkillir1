const express = require("express");
const router = express.Router();

// GET current user
router.get("/me", async (req, res) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await req.prisma.user.findUnique({
    where: { id: req.auth.userId },
  });

  if (user) {
    // Best practice: don't send the password hash back to the client
    delete user.password;
  }

  res.json({ user });
});

// list users for tenant
router.get("/", async (req, res) => {
  if (!req.tenantId) return res.status(403).json({ error: "Tenant missing" });
  let users = await req.prisma.user.findMany({ where: { tenantId: req.tenantId } });

  // Best practice: never send password hashes in a list
  users = users.map(user => {
    delete user.password;
    return user;
  });

  res.json({ users });
});

module.exports = router;