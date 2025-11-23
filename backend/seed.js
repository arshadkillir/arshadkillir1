const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'My First Restaurant',
    },
  });
  console.log(`Created tenant with id: ${tenant.id}`);

  // 2. Create an OWNER for that tenant
  const hashedPassword = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.create({
    data: {
      name: 'Admin Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });
  console.log(`Created owner with email: ${owner.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });