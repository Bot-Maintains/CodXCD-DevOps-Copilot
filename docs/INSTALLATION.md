# CodXCD Installation Guide

This guide will walk you through setting up CodXCD as a GitHub Copilot Extension.

## Prerequisites

- GitHub account with Copilot subscription
- Node.js 18+ and npm
- PostgreSQL database (for production)
- GitHub App creation permissions

## Quick Start

### 1. Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Use the provided `manifest.yml` for quick setup:

```bash
# Upload the manifest.yml file or use these settings:
```

**App Settings:**
- **Name:** CodXCD DevOps Copilot
- **Homepage URL:** `https://your-domain.com`
- **Webhook URL:** `https://your-domain.com/api/webhooks`
- **Webhook Secret:** Generate a secure random string

**Permissions:**
- Repository permissions:
  - Contents: Read
  - Issues: Write
  - Pull requests: Write
  - Checks: Write
  - Actions: Read
  - Deployments: Write
  - Environments: Read
  - Projects: Write
  - Security events: Read
  - Vulnerability alerts: Read
- Account permissions:
  - Email: Read

**Events:**
- installation, installation_repositories
- marketplace_purchase
- issues, issue_comment
- pull_request, pull_request_review
- workflow_run, check_run, check_suite
- deployment, deployment_status
- repository_vulnerability_alert
- project, project_card, project_column

### 2. Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/codxcd.git
cd codxcd
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```bash
# GitHub App Configuration
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYour private key here\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/codxcd

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

For development (SQLite):
```bash
# SQLite will be created automatically
npm run dev
```

For production (PostgreSQL):
```bash
# Create database
createdb codxcd

# Run migrations (if using a migration system)
npm run migrate
```

### 4. Start Development Server

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:client  # Frontend on :5173
npm run dev:server  # Backend on :3001
```

### 5. Install GitHub App

1. Go to your GitHub App settings
2. Click "Install App"
3. Choose repositories to install on
4. Complete the installation flow

### 6. Configure Copilot Extension

1. Register your app as a Copilot Extension:
   - Go to GitHub Settings > Copilot Extensions
   - Add your app's Copilot endpoint: `https://your-domain.com/api/copilot`

2. Test the integration:
   - Open GitHub Copilot Chat
   - Type `@codxcd What can you do?`
   - Verify you get a response

## Production Deployment

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t codxcd .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Environment Variables for Production

```bash
# Production settings
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Database (use managed PostgreSQL)
DATABASE_URL=postgresql://user:password@your-db-host:5432/codxcd

# GitHub App (same as development)
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="your_private_key"
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Security
JWT_SECRET=your-production-jwt-secret

# Optional: External services
OPENAI_API_KEY=your_openai_key
SLACK_WEBHOOK_URL=your_slack_webhook
```

## Verification

### Test GitHub App Installation

1. Check webhook delivery:
   - Go to your GitHub App settings
   - Click "Advanced" tab
   - Verify webhook deliveries are successful

2. Test basic functionality:
   - Create an issue in an installed repository
   - Check CodXCD dashboard for the new issue
   - Verify webhook processing in logs

### Test Copilot Integration

1. Open GitHub Copilot Chat (VS Code, GitHub.com, etc.)
2. Test basic commands:
   ```
   @codxcd What can you do?
   @codxcd Start timer for issue #123
   @codxcd Check security alerts
   @codxcd Deploy to staging
   ```

3. Verify responses are formatted correctly
4. Check that actions are reflected in the dashboard

## Troubleshooting

### Common Issues

**Webhook delivery failures:**
- Verify webhook URL is accessible
- Check webhook secret matches
- Ensure HTTPS is properly configured

**Copilot extension not responding:**
- Verify Copilot endpoint is registered
- Check server logs for errors
- Ensure GitHub App has proper permissions

**Database connection issues:**
- Verify DATABASE_URL is correct
- Check database server is running
- Ensure database exists and is accessible

**Authentication problems:**
- Verify GitHub App private key format
- Check App ID is correct
- Ensure proper permissions are granted

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

Check logs:
```bash
# Development
tail -f logs/combined.log

# Production
docker logs codxcd
```

### Health Checks

Test application health:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Support

- **Documentation:** [docs.codxcd.com](https://docs.codxcd.com)
- **GitHub Issues:** [github.com/your-org/codxcd/issues](https://github.com/your-org/codxcd/issues)
- **Email:** support@codxcd.com

## Next Steps

1. **Configure team settings** in the dashboard
2. **Set up project boards** for your repositories
3. **Enable security scanning** for vulnerability monitoring
4. **Configure deployment environments** for automated deployments
5. **Invite team members** to start using CodXCD

For advanced configuration and customization, see the [Configuration Guide](./CONFIGURATION.md).