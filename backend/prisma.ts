import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:12345678@localhost:5432/nandeyalpos?schema=public",
    },
  },
});
export default prisma;
