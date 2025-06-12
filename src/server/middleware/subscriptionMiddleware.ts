import { Request, Response, NextFunction } from 'express';
import { getUserPlan } from '../utils/plan';
import type { PlanTier } from '../utils/plan';

export function requirePlan(requiredPlan: PlanTier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userLogin = req.body.user || req.query.user || req.headers['x-user-login'];

    if (!userLogin) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const userPlan = await getUserPlan(userLogin as string);
      
      if (userPlan.expiresAt && new Date() > userPlan.expiresAt) {
        return res.status(403).json({ 
          error: 'Subscription expired', 
          requiredPlan,
          currentPlan: 'free'
        });
      }

      const planTiers: Record<PlanTier, number> = {
        'free': 0,
        'pro': 1,
        'enterprise': 2
      };

      if (planTiers[userPlan.plan] < planTiers[requiredPlan]) {
        return res.status(403).json({ 
          error: 'Insufficient subscription tier', 
          requiredPlan,
          currentPlan: userPlan.plan 
        });
      }

      next();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({ error: 'Failed to validate subscription' });
    }
  };
}

// Helper middleware for common plan requirements
export const requirePro = requirePlan('pro');
export const requireEnterprise = requirePlan('enterprise');
