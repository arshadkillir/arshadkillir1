# POS Backend (Express + Prisma v6)

## Setup

1) Copy `.env.example` -> `.env` and fill in your database and JWT secret values.

2) Install dependencies:
   ```bash
   npm install
   ```

3) Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

4) Create and apply the database migration:
   ```bash
   npx prisma migrate dev --name init
   ```

5) Start the development server:
   ```bash
   npm run dev
   ```

## Notes

- **Node Version**: Use Node 20 (LTS). On Windows, it's recommended to install nvm-windows and run `nvm install 20` then `nvm use 20`.
- **Middleware Context**: The authentication middleware attaches `req.prisma`, `req.tenantId`, and `req.outletId` to the request object. Use these in your route handlers to scope database queries correctly.