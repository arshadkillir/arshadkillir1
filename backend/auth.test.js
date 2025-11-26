const request = require('supertest');
const app = require('../app'); // Import the Express app definition, not the server entry point
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

// We will store the auth token for an owner user to test protected routes
let ownerToken;
let ownerUser;
let testTenant;

beforeAll(async () => {
  // Clean up the database before all tests run
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  // 1. Create a Tenant for our tests
  testTenant = await prisma.tenant.create({
    data: {
      name: 'Test Tenant',
    },
  });

  // 2. Create an OWNER user that we can use to log in and get a token
  const hashedPassword = await bcrypt.hash('password123', 10);
  ownerUser = await prisma.user.create({
    data: {
      name: 'Test Owner',
      email: 'owner@test.com',
      password: hashedPassword,
      role: 'OWNER',
      tenantId: testTenant.id,
    },
  });

  // 3. Log in as the owner to get a token for subsequent requests
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'owner@test.com',
      password: 'password123',
    });

  ownerToken = response.body.token;
});

afterAll(async () => {
  // Clean up the database after all tests have run
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.$disconnect();
});

describe('Auth Endpoints', () => {
  
  describe('POST /login', () => {
    it('should log in a user with correct credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail to log in with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /register', () => {
    it('should allow an OWNER to register a new STAFF user', async () => {
      const newUser = {
        name: 'Test Staff',
        email: 'staff@test.com',
        password: 'password123',
        role: 'STAFF',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${ownerToken}`) // Use the owner's token
        .send(newUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toEqual(newUser.email);
      expect(res.body.role).toEqual('STAFF');
      expect(res.body).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should return 403 Forbidden if no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Staff',
          email: 'staff2@test.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toEqual(403);
    });
  });
});