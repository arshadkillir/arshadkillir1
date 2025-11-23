const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // We'll use bcrypt to hash passwords

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // You can change the email and password here
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Platform Admin',
      password: hashedPassword,
      role: 'SUPERADMIN', // This user is a SUPERADMIN, not tied to a tenant
    },
  });

  console.log(`Created SUPERADMIN user: ${adminUser.email}`);
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