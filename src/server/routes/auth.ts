import express from 'express';
import { githubConfig, GITHUB_TOKEN_URL } from '../../utils/github';
import { config } from '../utils/config';

const router = express.Router();

// Initiate GitHub OAuth
router.get('/github', (_req, res) => {
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.append('client_id', githubConfig.clientId);
  authUrl.searchParams.append('redirect_uri', githubConfig.redirectUri);
  authUrl.searchParams.append('scope', githubConfig.scope);
  
  res.redirect(authUrl.toString());
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Code not provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.redirectUri,
      }),
    });

    const { access_token, error } = await tokenResponse.json();

    if (error || !access_token) {
      throw new Error(error || 'Failed to get access token');
    }

    // Store token in session/cookie
    req.session.githubToken = access_token;
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/login?error=github_auth_failed');
  }
});

export default router;
