import express, { Router } from 'express';
import { getUserPlan, setUserPlan, PlanTier, PLAN_FEATURES } from '../utils/plan';
import { createCheckoutSession, stripe } from '../utils/stripe';
import { config } from '../utils/config';

const subscriptionRouter = Router();

// Get user's current plan and features
subscriptionRouter.get('/:userLogin', async (req, res) => {
  try {
    const userPlan = await getUserPlan(req.params.userLogin);
    res.json(userPlan);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

// Get available plans and their features
subscriptionRouter.get('/plans', (_req, res) => {
  res.json({
    plans: {
      free: {
        name: 'Free',
        features: PLAN_FEATURES.free,
        price: 0
      },
      pro: {
        name: 'Pro',
        features: PLAN_FEATURES.pro,
        price: 9.99
      },
      enterprise: {
        name: 'Enterprise',
        features: PLAN_FEATURES.enterprise,
        price: 49.99
      }
    }
  });
});

// Create checkout session for subscription upgrade
subscriptionRouter.post('/create-checkout', async (req, res) => {
  const { plan } = req.body;
  const userLogin = req.body.user || req.query.user || req.headers['x-user-login'];

  if (!userLogin) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const session = await createCheckoutSession(plan, userLogin as string);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Cancel subscription
subscriptionRouter.post('/cancel', async (req, res) => {
  const userLogin = req.body.user || req.query.user || req.headers['x-user-login'];

  if (!userLogin) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const userPlan = await getUserPlan(userLogin);
    
    if (userPlan.plan === 'free') {
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    // Cancel at Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userLogin
    });

    if (subscriptions.data.length > 0) {
      await stripe.subscriptions.update(subscriptions.data[0].id, {
        cancel_at_period_end: true
      });
    }

    // Update local plan status (will be set to free when subscription actually ends via webhook)
    res.json({ message: 'Subscription cancellation scheduled' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook endpoint for payment provider callbacks
subscriptionRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing signature header' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripeWebhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { userLogin, plan } = event.data.object.metadata;

  try {
    switch (event) {
      case 'subscription.created':
      case 'subscription.updated': {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // Set expiration to 1 month from now
        await setUserPlan(userLogin, plan as PlanTier, expiresAt);
        break;
      }
      
      case 'subscription.deleted': {
        await setUserPlan(userLogin, 'free');
        break;
      }
      
      default: {
        console.warn('Unhandled webhook event:', event);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default subscriptionRouter;
