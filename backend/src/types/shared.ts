import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId: string | null;
    outletId: string | null;
  };
}
