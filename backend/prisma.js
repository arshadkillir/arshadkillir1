const { PrismaClient } = require('@prisma/client');

// Create and export a single instance of the Prisma Client.
const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
module.exports = prisma;