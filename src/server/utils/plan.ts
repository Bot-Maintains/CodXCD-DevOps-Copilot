// Utility to check user plan/subscription status
import { Pool } from 'pg';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';

export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface PlanFeatures {
  maxProjects: number;
  aiCodeFixing: boolean;
  advancedSecurity: boolean;
  unlimitedCICD: boolean;
  prioritySupport: boolean;
  teamManagement: boolean;
  analytics: boolean;
  customIntegrations: boolean;
  monthlyAICredits: number;     // Number of AI credits per month
  maxTeamSeats: number;         // Maximum team members
  maxApiCalls: number;          // API rate limiting
  trialFeatures: boolean;       // Can try premium features
  referralBonus: number;        // Extra credits for referrals
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    maxProjects: 3,
    aiCodeFixing: false,
    advancedSecurity: false,
    unlimitedCICD: false,
    prioritySupport: false,
    teamManagement: false,
    analytics: false,
    customIntegrations: false,
    monthlyAICredits: 10,
    maxTeamSeats: 1,
    maxApiCalls: 1000,
    trialFeatures: true,
    referralBonus: 5
  },
  pro: {
    maxProjects: 10,
    aiCodeFixing: true,
    advancedSecurity: true,
    unlimitedCICD: true,
    prioritySupport: true,
    teamManagement: false,
    analytics: false,
    customIntegrations: false,
    monthlyAICredits: 100,
    maxTeamSeats: 5,
    maxApiCalls: 10000,
    trialFeatures: true,
    referralBonus: 15
  },
  enterprise: {
    maxProjects: -1, // unlimited
    aiCodeFixing: true,
    advancedSecurity: true,
    unlimitedCICD: true,
    prioritySupport: true,
    teamManagement: true,
    analytics: true,
    customIntegrations: true,
    monthlyAICredits: -1, // unlimited
    maxTeamSeats: -1, // unlimited
    maxApiCalls: -1, // unlimited
    trialFeatures: true,
    referralBonus: 50
  },
};

// Database integration for user plans
const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.name,
  password: config.database.password,
  port: config.database.port,
});

export interface UserPlanInfo {
  plan: PlanTier;
  features: PlanFeatures;
  expiresAt: Date | null;
}

export async function getUserPlan(userLogin: string): Promise<UserPlanInfo> {
  try {
    const result = await pool.query(
      'SELECT plan, expires_at FROM user_plans WHERE user_login = $1',
      [userLogin]
    );
    
    const planFromDb: PlanTier = (result.rows[0]?.plan as PlanTier) || 'free';
    const expiresAt = result.rows[0]?.expires_at || null;
    
    // Check if subscription has expired
    const isExpired = expiresAt && new Date() > new Date(expiresAt);
    const plan = isExpired ? 'free' : planFromDb;

    // If expired, update the plan in the database
    if (isExpired && planFromDb !== 'free') {
      await setUserPlan(userLogin, 'free');
      console.log(`Subscription expired for user ${userLogin}, downgraded to free plan`);
    }
    
    return {
      plan,
      features: PLAN_FEATURES[plan],
      expiresAt: isExpired ? null : expiresAt,
    };
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return {
      plan: 'free',
      features: PLAN_FEATURES.free,
      expiresAt: null,
    };
  }
}

export async function setUserPlan(
  userLogin: string, 
  plan: PlanTier, 
  expiresAt?: Date
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO user_plans (user_login, plan, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_login) 
       DO UPDATE SET plan = $2, expires_at = $3`,
      [userLogin, plan, expiresAt || null]
    );
  } catch (error) {
    console.error('Error setting user plan:', error);
    throw new Error('Failed to update user plan');
  }
}

// Middleware factory for feature-specific gates
export function requireFeature(feature: keyof PlanFeatures) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user || req.query.user || req.headers['x-user-login'];
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { features, plan, expiresAt } = await getUserPlan(user as string);
      
      // Check if subscription has expired
      if (expiresAt && new Date() > expiresAt) {
        return res.status(403).json({ 
          error: 'Subscription expired',
          upgrade: true,
          currentPlan: plan
        });
      }

      // Check if feature is available in current plan
      if (!features[feature]) {
        return res.status(403).json({ 
          error: `This feature requires an upgrade`,
          requiredFeature: feature,
          upgrade: true,
          currentPlan: plan
        });
      }

      next();
    } catch (error) {
      console.error(`Error in requireFeature(${feature}) middleware:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Middleware for Pro plan features
export async function requireProPlan(req: Request, res: Response, next: NextFunction) {
  const user = req.body.user || req.query.user || req.headers['x-user-login'];
  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { plan, expiresAt } = await getUserPlan(user as string);
    
    // Check if subscription has expired
    if (expiresAt && new Date() > expiresAt) {
      return res.status(403).json({ 
        error: 'Subscription expired',
        upgrade: true,
        currentPlan: plan
      });
    }

    if (plan !== 'pro' && plan !== 'enterprise') {
      return res.status(403).json({ 
        error: 'Pro or Enterprise plan required for this feature',
        upgrade: true,
        currentPlan: plan
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireProPlan middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

interface UsageQuota {
  aiCreditsUsed: number;
  apiCallsCount: number;
  teamSeatsUsed: number;
  lastResetDate: Date;
}

interface TrialStatus {
  featureId: string;
  startDate: Date;
  endDate: Date;
  used: boolean;
}

export async function trackUsage(userLogin: string, type: 'ai' | 'api' | 'seat'): Promise<boolean> {
  try {
    const { plan, features } = await getUserPlan(userLogin);
    const quota = await getCurrentQuota(userLogin);
    
    switch (type) {
      case 'ai':
        if (features.monthlyAICredits === -1) return true; // Unlimited
        return quota.aiCreditsUsed < features.monthlyAICredits;
      case 'api':
        if (features.maxApiCalls === -1) return true; // Unlimited
        return quota.apiCallsCount < features.maxApiCalls;
      case 'seat':
        if (features.maxTeamSeats === -1) return true; // Unlimited
        return quota.teamSeatsUsed < features.maxTeamSeats;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
    return false;
  }
}

async function getCurrentQuota(userLogin: string): Promise<UsageQuota> {
  const result = await pool.query(
    'SELECT * FROM user_quotas WHERE user_login = $1',
    [userLogin]
  );
  
  if (!result.rows[0]) {
    // Initialize new quota
    const newQuota: UsageQuota = {
      aiCreditsUsed: 0,
      apiCallsCount: 0,
      teamSeatsUsed: 0,
      lastResetDate: new Date()
    };
    
    await pool.query(
      'INSERT INTO user_quotas (user_login, ai_credits_used, api_calls_count, team_seats_used, last_reset_date) VALUES ($1, $2, $3, $4, $5)',
      [userLogin, 0, 0, 0, new Date()]
    );
    
    return newQuota;
  }
  
  return {
    aiCreditsUsed: result.rows[0].ai_credits_used,
    apiCallsCount: result.rows[0].api_calls_count,
    teamSeatsUsed: result.rows[0].team_seats_used,
    lastResetDate: result.rows[0].last_reset_date
  };
}

export async function startFeatureTrial(userLogin: string, featureId: string): Promise<boolean> {
  try {
    const { features } = await getUserPlan(userLogin);
    
    if (!features.trialFeatures) {
      return false;
    }
    
    // Check if trial was already used
    const trialResult = await pool.query(
      'SELECT * FROM feature_trials WHERE user_login = $1 AND feature_id = $2',
      [userLogin, featureId]
    );
    
    if (trialResult.rows[0]) {
      return false; // Trial already used
    }
    
    // Start new trial
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 14-day trial
    
    await pool.query(
      'INSERT INTO feature_trials (user_login, feature_id, start_date, end_date, used) VALUES ($1, $2, $3, $4, $5)',
      [userLogin, featureId, startDate, endDate, true]
    );
    
    return true;
  } catch (error) {
    console.error('Error starting feature trial:', error);
    return false;
  }
}

// Track feature usage and increment counters
export async function incrementUsage(userLogin: string, type: 'ai' | 'api' | 'seat'): Promise<void> {
  const columnMap = {
    ai: 'ai_credits_used',
    api: 'api_calls_count',
    seat: 'team_seats_used'
  };
  
  await pool.query(
    `UPDATE user_quotas 
     SET ${columnMap[type]} = ${columnMap[type]} + 1 
     WHERE user_login = $1`,
    [userLogin]
  );
}

// Reset monthly quotas
export async function resetMonthlyQuotas(): Promise<void> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  await pool.query(
    `UPDATE user_quotas 
     SET ai_credits_used = 0, 
         api_calls_count = 0,
         last_reset_date = NOW()
     WHERE last_reset_date < $1`,
    [oneMonthAgo]
  );
}
