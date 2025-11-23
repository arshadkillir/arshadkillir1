# Backend Scripts

This directory contains utility scripts for managing and maintaining the backend application.

## Available Scripts

### `npm run db:seed`

This script populates the database with essential default data. It is safe to run multiple times.

**What it does:**

- **Creates Subscription Plans:** It ensures that default SaaS subscription plans (e.g., "Basic", "Pro") exist in the `SubscriptionPlan` table. If they already exist, it does nothing.
- **Creates a SUPERADMIN User:** It checks if a `SUPERADMIN` user with the email `superadmin@example.com` exists. If not, it creates one, associated with a "Default Tenant". This is useful for initial setup or for regaining access to the system if no other admin accounts exist.

**When to use it:**

- After setting up the project for the first time.
- After resetting the database.
- If you are unable to log in and need to ensure a `SUPERADMIN` account exists.