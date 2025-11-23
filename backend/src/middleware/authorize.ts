import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/shared.ts';
import { Prisma } from '@prisma/client';
const Role = Prisma.Role;

/**
 * Middleware to authorize users based on their roles.
 * @param roles - An array of roles that are allowed to access the route.
 */
export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      // This should technically be caught by the 'protect' middleware first
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res
        .status(403)
        .json({ error: `Forbidden. User role '${req.user.role}' is not authorized for this route.` });
    }

    next();
  };
};
