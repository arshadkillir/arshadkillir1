import type { Response, NextFunction } from 'express';
import prisma from '../prisma';
import type { AuthenticatedRequest } from '../types/shared.ts';

/**
 * Middleware to check if the user's tenant has an active subscription.
 * This should be placed after the 'protect' middleware.
 */
export const checkSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // req.user is attached by the 'protect' middleware
  if (!req.user) {
    // This case should ideally not be hit if 'protect' runs first,
    // but it's a good safeguard.
    return res.status(401).json({ error: 'Not authorized.' });
  }

  // SUPERADMIN role bypasses the subscription check
  if (req.user.role === 'SUPERADMIN') {
    return next();
  }

  if (!req.user.tenantId) {
    return res.status(403).json({ error: 'Access denied. User is not associated with a tenant.' });
  }

  try {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId: req.user.tenantId },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Access denied. Your subscription is not active.', subscriptionStatus: subscription?.status || 'NOT_FOUND' });
    }

    // Subscription is active, proceed to the requested route
    next();
  } catch (error) {
    console.error('Subscription Check Error:', error);
    next(error);
  }
};
