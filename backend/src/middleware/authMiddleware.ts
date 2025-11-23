import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma.ts';
import type { AuthenticatedRequest } from '../types/shared.ts';

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Get user from the token and attach to request (excluding password)
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          role: true,
          tenantId: true,
          outletId: true,
        },
      });

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};
