# CodXCD GitHub Deployment Guide

## Prerequisites

1. **GitHub Account** with organization (for verified publisher status)
2. **Domain name** for your application (e.g., `codxcd.com`)
3. **Hosting platform** (Vercel, Netlify, Railway, or custom server)
4. **Database** (PostgreSQL recommended for production)

## Step 1: Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Use these settings:

```yaml
Name: CodXCD DevOps Copilot
Homepage URL: https://your-domain.com
Webhook URL: https://your-domain.com/api/webhooks
Callback URL: https://your-domain.com/auth/callback
```

**Permissions:**
- Repository: Contents (Read), Issues (Write), Pull requests (Write), Checks (Write)
- Organization: Members (Read)
- Account: Email addresses (Read)

**Events:**
- installation, installation_repositories
- marketplace_purchase
- issues, issue_comment
- pull_request, pull_request_review
- workflow_run, check_run, check_suite
- deployment, deployment_status
- repository_vulnerability_alert

## Step 2: Deploy to Production

### Option A: Vercel (Recommended)

1. **Connect GitHub Repository:**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Initial CodXCD implementation"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy

3. **Configure Environment Variables:**
   ```bash
   GITHUB_APP_ID=your_app_id
   GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.vercel.app
   ```

### Option B: Railway

1. **Connect Repository:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set GITHUB_APP_ID=your_app_id
   railway variables set GITHUB_PRIVATE_KEY="your_private_key"
   # ... add all other variables
   ```

### Option C: Docker Deployment

1. **Build Docker Image:**
   ```bash
   docker build -t codxcd .
   docker tag codxcd your-registry/codxcd:latest
   docker push your-registry/codxcd:latest
   ```

2. **Deploy with Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       image: your-registry/codxcd:latest
       ports:
         - "3001:3001"
       environment:
         - GITHUB_APP_ID=${GITHUB_APP_ID}
         - GITHUB_PRIVATE_KEY=${GITHUB_PRIVATE_KEY}
         - DATABASE_URL=${DATABASE_URL}
       depends_on:
         - postgres
     
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: codxcd
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

## Step 3: Configure GitHub App

1. **Update GitHub App Settings:**
   - Webhook URL: `https://your-domain.com/api/webhooks`
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/auth/callback`

2. **Generate Private Key:**
   - Download the private key from GitHub App settings
   - Convert to single line: `cat private-key.pem | tr '\n' '\\n'`
   - Add to environment variables

3. **Test Webhook Delivery:**
   - Install the app on a test repository
   - Check webhook deliveries in GitHub App settings
   - Verify logs show successful processing

## Step 4: Register as Copilot Extension

1. **Submit Copilot Extension Application:**
   - Go to GitHub Copilot Extensions (when available)
   - Register your app as a Copilot Extension
   - Provide endpoint: `https://your-domain.com/api/copilot`

2. **Test Copilot Integration:**
   ```
   @codxcd What can you do?
   @codxcd Start timer for issue #123
   @codxcd Check security alerts
   ```

## Step 5: Prepare for Marketplace

1. **Create Marketing Assets:**
   - High-resolution logo (512x512px)
   - Feature screenshots
   - Demo videos (private YouTube links)

2. **Set Up Pricing Plans:**
   - Free: Basic features, 3 repositories
   - Pro: $29/user/month, unlimited features

3. **Submit to GitHub Marketplace:**
   - Complete marketplace application
   - Provide all required documentation
   - Wait for GitHub review (typically 1-2 weeks)

## Step 6: Monitor and Maintain

1. **Set Up Monitoring:**
   ```bash
   # Health check endpoint
   curl https://your-domain.com/health
   
   # Monitor logs
   tail -f logs/combined.log
   ```

2. **Update Dependencies:**
   ```bash
   npm audit
   npm update
   ```

3. **Backup Database:**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

## Troubleshooting

### Common Issues:

1. **Webhook Delivery Failures:**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Ensure HTTPS is properly configured

2. **Copilot Extension Not Responding:**
   - Verify endpoint is registered correctly
   - Check server logs for errors
   - Test with curl: `curl -X POST https://your-domain.com/api/copilot/chat`

3. **Database Connection Issues:**
   - Verify DATABASE_URL format
   - Check database server is running
   - Ensure proper SSL configuration

### Support Resources:

- **GitHub App Documentation:** https://docs.github.com/en/apps
- **Copilot Extensions:** https://docs.github.com/en/copilot/building-copilot-extensions
- **Marketplace Guidelines:** https://docs.github.com/en/apps/github-marketplace

## Security Checklist

- [ ] Environment variables are properly secured
- [ ] GitHub App private key is encrypted
- [ ] Webhook signatures are verified
- [ ] Database connections use SSL
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive data
- [ ] Logs don't contain secrets

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Implement caching for GitHub API calls
- [ ] Use connection pooling for database
- [ ] Set up CDN for static assets
- [ ] Monitor response times
- [ ] Implement graceful shutdowns

Your CodXCD bot is now ready for production deployment! 🚀