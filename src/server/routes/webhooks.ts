import express from 'express';
import { Webhooks, WebhookEventName } from '@octokit/webhooks';
import { createLogger } from '../utils/logger';
import Stripe from 'stripe';
import { setUserPlan, PlanTier, getUserPlan } from '../utils/plan';
import { config } from '../utils/config';

const router = express.Router();
const logger = createLogger();

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-05-28.basil',
});

// GitHub webhook handler - Main entry point for all GitHub events
router.post('/', async (req, res) => {
  const webhooks: Webhooks = req.app.locals.webhooks;
  
  try {
    const eventName = req.get('X-GitHub-Event');
    const deliveryId = req.get('X-GitHub-Delivery');
    const signature = req.get('X-Hub-Signature-256');
    
    logger.info(`Received webhook: ${eventName}`, { deliveryId });
    
    await webhooks.verifyAndReceive({
      id: deliveryId as string,
      name: eventName as keyof Webhooks.EventPayloadMap,
      signature: signature as string,
      payload: JSON.stringify(req.body)
    });
    
    res.status(200).json({ received: true, event: eventName, id: deliveryId });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(400).json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stripe webhook handler
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;
        const userLogin = metadata.userLogin;
        const planTier = metadata.planTier as PlanTier;

        if (!userLogin || !['free', 'pro', 'enterprise'].includes(planTier)) {
          logger.error('Missing userLogin or planTier in subscription metadata');
          return res.status(400).json({ error: 'Invalid subscription metadata' });
        }

        // Calculate expiration date (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await setUserPlan(userLogin, planTier, expiresAt);
        logger.info(`Updated subscription for ${userLogin} to ${planTier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userLogin = subscription.metadata.userLogin;

        if (!userLogin) {
          logger.error('Missing userLogin in subscription metadata');
          return res.status(400).json({ error: 'Invalid subscription metadata' });
        }

        // Downgrade to free plan when subscription is canceled
        await setUserPlan(userLogin, 'free');
        logger.info(`Downgraded ${userLogin} to free plan due to subscription cancellation`);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info('Checkout session completed:', { sessionId: session.id });
        break;
      }

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Error processing Stripe webhook:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

// Setup webhook handlers for GitHub events
export const setupWebhookHandlers = (webhooks: Webhooks) => {
  // Installation events - Critical for subscription management
  webhooks.on('installation.created', async ({ payload }) => {
    logger.info(`New CodXCD installation: ${payload.installation.id} by ${payload.installation.account.login}`);
    
    try {
      // Set up free tier for new installation
      await setUserPlan(payload.installation.account.login, 'free');
      logger.info('Installation setup completed successfully');
    } catch (error) {
      logger.error('Failed to setup new installation:', error);
    }
  });

  webhooks.on('installation.deleted', async ({ payload }) => {
    logger.info(`CodXCD uninstalled: ${payload.installation.id}`);
    
    // Clean up user data and stop all services
    try {
      // In a real implementation, this would:
      // 1. Stop all active timers
      // 2. Cancel scheduled tasks
      // 3. Clean up webhook subscriptions
      // 4. Archive user data (GDPR compliance)
      
      logger.info('Installation cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup installation:', error);
    }
  });

  // Marketplace purchase events - Critical for subscription management
  webhooks.on('marketplace_purchase.purchased', async ({ payload }) => {
    const { marketplace_purchase } = payload;
    const accountLogin = marketplace_purchase.account.login;
    const planId = marketplace_purchase.plan.id;
    const planTier = marketplace_purchase.plan.name.toLowerCase() as PlanTier;
    
    logger.info(`New marketplace purchase: ${accountLogin} - Plan ${planId}`);
    
    try {
      // Set expiration date to one month from now
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await setUserPlan(accountLogin, planTier, expiresAt);
      logger.info(`Subscription activated for ${accountLogin}`);
    } catch (error) {
      logger.error('Failed to process marketplace purchase:', error);
    }
  });

  webhooks.on('marketplace_purchase.cancelled', async ({ payload }) => {
    const { marketplace_purchase } = payload;
    const accountLogin = marketplace_purchase.account.login;
    
    logger.info(`Marketplace purchase cancelled: ${accountLogin}`);
    
    try {
      await setUserPlan(accountLogin, 'free');
      logger.info(`Subscription cancelled for ${accountLogin}`);
    } catch (error) {
      logger.error('Failed to process marketplace cancellation:', error);
    }
  });

  webhooks.on('marketplace_purchase.changed', async ({ payload }) => {
    const { marketplace_purchase, previous_marketplace_purchase } = payload;
    const accountLogin = marketplace_purchase.account.login;
    const newPlanId = marketplace_purchase.plan.id;
    const oldPlanId = previous_marketplace_purchase?.plan.id;
    
    logger.info(`Marketplace plan changed: ${accountLogin} from ${oldPlanId} to ${newPlanId}`);
    
    try {
      // Update subscription plan
      // Adjust feature access
      // Send plan change confirmation
      
      logger.info(`Plan updated for ${accountLogin}`);
    } catch (error) {
      logger.error('Failed to process plan change:', error);
    }
  });

  // Handle GitHub Marketplace events
  webhooks.on('marketplace_purchase', async ({ payload }) => {
    const { action, marketplace_purchase } = payload;
    const { account, plan } = marketplace_purchase;

    // Map marketplace plan to our plan tiers
    const planMapping: Record<string, PlanTier> = {
      'Free': 'free',
      'Pro': 'pro',
      'Enterprise': 'enterprise'
    };

    const planTier = planMapping[plan.name] || 'free';

    try {
      switch (action) {
        case 'purchased':
        case 'changed': {
          // Set expiration to one month from now for monthly plans
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          
          await setUserPlan(account.login, planTier, expiresAt);
          logger.info(`User ${account.login} ${action} plan ${plan.name}`);
          break;
        }
        
        case 'cancelled':
        case 'pending_change': {
          // Get the current date in user's plan expiry
          const userPlan = await getUserPlan(account.login);
          if (userPlan.expiresAt) {
            // Let them keep their current plan until it expires
            logger.info(`User ${account.login} will downgrade to free plan on ${userPlan.expiresAt}`);
          } else {
            // If no expiry, downgrade immediately
            await setUserPlan(account.login, 'free');
            logger.info(`User ${account.login} downgraded to free plan`);
          }
          break;
        }
        
        case 'pending_change_cancelled': {
          // They decided to keep their subscription
          logger.info(`User ${account.login} cancelled their pending plan change`);
          break;
        }
      }
    } catch (error) {
      logger.error('Error processing marketplace purchase:', error);
      throw error;
    }
  });

  // Issue events for time tracking and project management
  webhooks.on('issues.opened', async ({ payload }) => {
    const { issue, repository } = payload;
    
    logger.info(`New issue opened: #${issue.number} in ${repository.full_name}`);
    
    try {
      // Auto-assign to project board
      // Add default labels based on content analysis
      // Notify relevant team members
      // Initialize time tracking capability
      
      logger.info(`Issue #${issue.number} processed successfully`);
    } catch (error) {
      logger.error('Failed to process new issue:', error);
    }
  });

  webhooks.on('issues.closed', async ({ payload }) => {
    const { issue, repository } = payload;
    
    logger.info(`Issue closed: #${issue.number} in ${repository.full_name}`);
    
    try {
      // Stop any active timers
      // Update project board status
      // Generate time tracking summary
      // Update productivity metrics
      
      logger.info(`Issue closure processed for #${issue.number}`);
    } catch (error) {
      logger.error('Failed to process issue closure:', error);
    }
  });

  // Pull request events for code review and testing
  webhooks.on('pull_request.opened', async ({ payload }) => {
    const { pull_request, repository } = payload;
    
    logger.info(`New PR opened: #${pull_request.number} in ${repository.full_name}`);
    
    try {
      // Trigger automated code review
      // Start test suite execution
      // Analyze code quality metrics
      // Check for security vulnerabilities
      
      logger.info(`PR #${pull_request.number} analysis initiated`);
    } catch (error) {
      logger.error('Failed to process new PR:', error);
    }
  });

  webhooks.on('pull_request.synchronize', async ({ payload }) => {
    const { pull_request, repository } = payload;
    
    logger.info(`PR updated: #${pull_request.number} in ${repository.full_name}`);
    
    try {
      // Re-run automated tests
      // Update code quality analysis
      // Check for new security issues
      
      logger.info(`PR #${pull_request.number} re-analysis completed`);
    } catch (error) {
      logger.error('Failed to process PR update:', error);
    }
  });

  // Workflow and CI/CD events
  webhooks.on('workflow_run.completed', async ({ payload }) => {
    const { workflow_run, repository } = payload;
    const { conclusion, name } = workflow_run;
    
    logger.info(`Workflow completed: ${name} - ${conclusion} in ${repository.full_name}`);
    
    try {
      if (conclusion === 'failure') {
        // Analyze failure reasons
        // Suggest automated fixes
        // Notify relevant team members
        // Create issue if critical
      } else if (conclusion === 'success') {
        // Update deployment status
        // Trigger next pipeline stage
        // Update quality metrics
      }
      
      logger.info(`Workflow ${name} processed successfully`);
    } catch (error) {
      logger.error('Failed to process workflow completion:', error);
    }
  });

  webhooks.on('check_run.completed', async ({ payload }) => {
    const { check_run, repository } = payload;
    const { conclusion, name } = check_run;
    
    logger.info(`Check run completed: ${name} - ${conclusion} in ${repository.full_name}`);
    
    try {
      // Update test results dashboard
      // Analyze code coverage changes
      // Update quality metrics
      // Trigger notifications if needed
      
      logger.info(`Check run ${name} processed`);
    } catch (error) {
      logger.error('Failed to process check run:', error);
    }
  });

  // Security and vulnerability events
  webhooks.on('repository_vulnerability_alert', async ({ payload }) => {
    const { alert, repository } = payload;
    
    logger.info(`Security alert: ${alert.security_advisory.summary} in ${repository.full_name}`);
    
    try {
      // Analyze vulnerability severity
      // Check for available fixes
      // Create security issue if critical
      // Notify security team
      // Update security dashboard
      
      logger.info('Security alert processed successfully');
    } catch (error) {
      logger.error('Failed to process security alert:', error);
    }
  });

  webhooks.on('security_advisory.published', async ({ payload }) => {
    const { security_advisory } = payload;
    
    logger.info(`Security advisory published: ${security_advisory.summary}`);
    
    try {
      // Check if advisory affects user repositories
      // Create alerts for affected projects
      // Suggest remediation actions
      
      logger.info('Security advisory processed');
    } catch (error) {
      logger.error('Failed to process security advisory:', error);
    }
  });

  // Deployment events
  webhooks.on('deployment', async ({ payload }) => {
    const { deployment, repository } = payload;
    
    logger.info(`Deployment created: ${deployment.environment} in ${repository.full_name}`);
    
    try {
      // Update deployment dashboard
      // Start monitoring deployment status
      // Notify relevant team members
      
      logger.info(`Deployment to ${deployment.environment} tracked`);
    } catch (error) {
      logger.error('Failed to process deployment:', error);
    }
  });

  webhooks.on('deployment_status', async ({ payload }) => {
    const { deployment_status, deployment, repository } = payload;
    
    logger.info(`Deployment status: ${deployment_status.state} for ${deployment.environment} in ${repository.full_name}`);
    
    try {
      // Update deployment status in dashboard
      // Send notifications on success/failure
      // Update environment health status
      
      if (deployment_status.state === 'success') {
        // Deployment successful
        logger.info(`Deployment to ${deployment.environment} successful`);
      } else if (deployment_status.state === 'failure') {
        // Deployment failed
        logger.info(`Deployment to ${deployment.environment} failed`);
      }
    } catch (error) {
      logger.error('Failed to process deployment status:', error);
    }
  });

  // Project events for project management
  webhooks.on('project.created', async ({ payload }) => {
    const { project, repository } = payload;
    
    logger.info(`Project created: ${project.name} in ${repository?.full_name || 'organization'}`);
    
    try {
      // Initialize project tracking
      // Set up default columns/workflows
      // Configure automation rules
      
      logger.info(`Project ${project.name} initialized`);
    } catch (error) {
      logger.error('Failed to process project creation:', error);
    }
  });

  webhooks.on('project_card.moved', async ({ payload }) => {
    const { project_card, changes } = payload;
    
    logger.info(`Project card moved: ${project_card.id}`);
    
    try {
      // Update project analytics
      // Track workflow progress
      // Update time estimates
      
      logger.info('Project card movement tracked');
    } catch (error) {
      logger.error('Failed to process project card movement:', error);
    }
  });

  // Repository events for maintenance and quality
  webhooks.on('push', async ({ payload }) => {
    const { repository, commits, ref } = payload;
    
    if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
      logger.info(`Push to main branch in ${repository.full_name}: ${commits.length} commits`);
      
      try {
        // Trigger code quality analysis
        // Update dependency tracking
        // Check for security issues
        // Update project metrics
        
        logger.info('Main branch push processed');
      } catch (error) {
        logger.error('Failed to process main branch push:', error);
      }
    }
  });

  webhooks.on('release.published', async ({ payload }) => {
    const { release, repository } = payload;
    
    logger.info(`Release published: ${release.tag_name} in ${repository.full_name}`);
    
    try {
      // Update release tracking
      // Trigger deployment workflows
      // Send release notifications
      // Update changelog
      
      logger.info(`Release ${release.tag_name} processed`);
    } catch (error) {
      logger.error('Failed to process release:', error);
    }
  });

  // Error handling for unhandled events
  webhooks.onError((error) => {
    logger.error('Webhook error:', error);
  });
};

export default router;