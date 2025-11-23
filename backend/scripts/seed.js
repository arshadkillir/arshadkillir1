import bcrypt from 'bcryptjs';
import prisma from '../src/prisma.js';

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123'; // Use a more secure password in production

  // 1. Create a default Tenant if it doesn't exist
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'Default Tenant' },
  });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Default Tenant' },
    });
    console.log(`Created default tenant: ${tenant.name}`);
  }

  // 2. Create a default Outlet for the Tenant if it doesn't exist
  let outlet = await prisma.outlet.findFirst({
    where: { name: 'Main Branch', tenantId: tenant.id },
  });
  if (!outlet) {
    outlet = await prisma.outlet.create({
      data: {
        name: 'Main Branch',
        tenantId: tenant.id, // Associate outlet with the tenant
      },
    });
    console.log(`Created default outlet: ${outlet.name}`);
  }

  // 3. Create a default Floor for the outlet if it doesn't exist
  let floor = await prisma.floor.findFirst({
    where: { name: 'Ground Floor', outletId: outlet.id },
  });

  if (!floor) {
    floor = await prisma.floor.create({
      data: {
        name: 'Ground Floor',
        outletId: outlet.id,
      },
    });
    console.log(`Created default floor: ${floor.name}`);
  }

  // 4. Create the SUPERADMIN user and associate them with the tenant and outlet
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'SUPERADMIN',
        isActive: true,
        tenantId: tenant.id,   // Associate user with the tenant
        outletId: outlet.id, // Associate user with the default outlet
      },
    });
    console.log(`Admin user created with email: ${adminEmail}`);
  } else {
    console.log('Admin user already exists. Seeding skipped.');
  }

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