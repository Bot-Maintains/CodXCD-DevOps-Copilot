import express from 'express';
import { App } from '@octokit/app';
import { createLogger } from '../utils/logger';

const router = express.Router();
const logger = createLogger();

// Import subscription routes
import subscriptionRoutes from './subscription';

// Mount subscription routes
router.use('/subscription', subscriptionRoutes);

// Get repositories
router.get('/repositories', async (req, res) => {
  const githubApp: App = req.app.locals.githubApp;
  
  try {
    // This would typically get repositories for the authenticated user/installation
    const repositories = [
      {
        id: 1,
        name: 'web-app',
        full_name: 'company/web-app',
        description: 'Main web application',
        language: 'TypeScript',
        stars: 125,
        forks: 32,
        open_issues: 12,
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'api-service',
        full_name: 'company/api-service',
        description: 'Backend API service',
        language: 'Node.js',
        stars: 89,
        forks: 21,
        open_issues: 8,
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json(repositories);
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      activeIssues: 24,
      securityAlerts: 3,
      deploymentsToday: 12,
      timeTrackedThisWeek: 142,
      totalRepositories: 8,
      teamMembers: 12
    };
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const activity = [
      {
        id: 1,
        type: 'commit',
        title: 'Fix authentication bug in user service',
        repository: 'web-app',
        user: 'john-doe',
        timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        id: 2,
        type: 'deployment',
        title: 'Deployed to production',
        repository: 'api-service',
        user: 'codxcd-bot',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];
    
    res.json(activity);
  } catch (error) {
    logger.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Start time tracking
router.post('/time-tracking/start', async (req, res) => {
  const { issueNumber, repository } = req.body;
  
  try {
    // This would integrate with GitHub Issues API to add a comment or check
    const timeEntry = {
      id: Date.now(),
      issueNumber,
      repository,
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    logger.info(`Started time tracking for issue #${issueNumber} in ${repository}`);
    res.json(timeEntry);
  } catch (error) {
    logger.error('Error starting time tracking:', error);
    res.status(500).json({ error: 'Failed to start time tracking' });
  }
});

// Stop time tracking
router.post('/time-tracking/stop', async (req, res) => {
  const { entryId } = req.body;
  
  try {
    const timeEntry = {
      id: entryId,
      endTime: new Date().toISOString(),
      duration: Math.floor(Math.random() * 7200), // Random duration for demo
      status: 'completed'
    };
    
    logger.info(`Stopped time tracking for entry ${entryId}`);
    res.json(timeEntry);
  } catch (error) {
    logger.error('Error stopping time tracking:', error);
    res.status(500).json({ error: 'Failed to stop time tracking' });
  }
});

export default router;