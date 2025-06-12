import { config } from '../server/utils/config';

export const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
export const GITHUB_API_URL = 'https://api.github.com';

export const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: `${config.appUrl}/auth/github/callback`,
  scope: 'repo admin:org security_events workflow user',
};

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export async function getGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function getGitHubRepos(token: string): Promise<GitHubRepo[]> {
  const response = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}
