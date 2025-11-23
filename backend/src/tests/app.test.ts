import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock the prisma client. This must be at the top.
vi.mock('../prisma');

import app from '../app';

describe('API Health Check', () => {
  it('should return 200 for the root path', async () => {
    // This is a placeholder test. Assuming your `loadRoutes`
    // might add a root health check endpoint later.
    // For now, let's test a known non-existent route.
    const res = await request(app).get('/api/');
    expect(res.status).not.toBe(500); // Should not be an internal server error
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
