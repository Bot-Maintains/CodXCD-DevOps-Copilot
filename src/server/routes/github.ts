import express from 'express';
import { getGitHubRepos, getGitHubUser } from '../../utils/github';

const router = express.Router();

// Check authentication status
router.get('/auth/status', (req, res) => {
  const isAuthenticated = !!req.session.githubToken;
  res.json({ isAuthenticated });
});

// Get GitHub repositories
router.get('/github/repos', async (req, res) => {
  try {
    if (!req.session.githubToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const repos = await getGitHubRepos(req.session.githubToken);
    res.json(repos);
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get GitHub statistics
router.get('/github/stats', async (req, res) => {
  try {
    if (!req.session.githubToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const repos = await getGitHubRepos(req.session.githubToken);
    
    // Calculate real statistics from repos
    const stats = {
      activeIssues: repos.reduce((sum, repo) => sum + repo.open_issues_count, 0),
      securityAlerts: 0, // You'll need to implement security alerts API
      deployments: 0, // You'll need to implement deployments API
      timeTracked: 0, // You'll need to implement time tracking
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
