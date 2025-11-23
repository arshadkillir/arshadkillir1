
POS SaaS Enterprise - Hybrid (Postgres + Docker + PWA)
=====================================================

This scaffold contains a full POS SaaS hybrid example:
- Backend: Node.js + Express + Prisma (Postgres)
- Frontend: React + Vite + PWA support (service worker)
- Hybrid: local (sqlite) fallback for offline + central Postgres connectivity notes
- Features: Dine-in (table management), Takeaway, Delivery, Menu & Recipes, Inventory, Purchases, KDS (WebSocket), Sync scripts, Staff & CRM, simple AI-report placeholder
- Deployment: Docker Compose (dev & prod), systemd timer example, deploy script template
- Seed data and CSV sheets provided

Important: replace secrets in .env before production.
