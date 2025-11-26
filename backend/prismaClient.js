// c:\Users\DELL\Desktop\nandeyal pos\backend\prismaClient.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["warn", "error", "info"]
});

module.exports = prisma;