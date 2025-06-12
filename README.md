# CodXCD - GitHub Copilot Extension for DevOps

CodXCD is a premium GitHub Copilot Extension that provides comprehensive DevOps automation and tooling through natural language interactions and a modern web dashboard.

## 🚀 Features

### 🧠 **AI Code Analysis & Fixing** ⭐ NEW!
- **Intelligent Code Analysis**: Deep analysis of entire repositories with human-like understanding
- **Automated Code Fixing**: Fix security vulnerabilities, bugs, and performance issues automatically
- **Human-Quality Code**: Generated fixes maintain your coding style and project conventions
- **Comprehensive Coverage**: Handles JavaScript, TypeScript, Python, Java, and more
- **Smart Pull Requests**: Creates detailed PRs with explanations for all changes

### Core Capabilities
- **Time Tracking**: Track time on issues and pull requests with visual timers
- **Automated Testing**: Orchestrate test suites and manage manual testing workflows
- **Security Scanning**: Monitor vulnerabilities and security alerts across repositories
- **Project Management**: Automate GitHub project boards and roadmap visualization
- **CI/CD Monitoring**: Track deployments and automatically fix workflow issues
- **Code Quality**: Assess code quality and automate review processes
- **Dependency Management**: Track and update package dependencies
- **Release Automation**: Publish releases and packages automatically
- **Semantic Search**: Search code using natural language queries

### Copilot Integration
- Natural language commands through GitHub Copilot Chat
- Intelligent automation suggestions
- Context-aware responses and actions
- Integration with GitHub's Copilot Extensions platform

## 🎯 Installation

### GitHub Marketplace
1. Visit the [GitHub Marketplace](https://github.com/marketplace)
2. Search for "CodXCD"
3. Click "Install" and follow the setup instructions

### Manual Setup
1. Clone this repository
2. Install dependencies: `npm install`
3. Configure environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

## 🔧 Configuration

### Environment Variables
```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Database
DATABASE_URL=your_database_url

# JWT Secret
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### GitHub App Permissions
The app requires the following permissions:
- **Repository permissions**: `contents:read`, `issues:write`, `pull_requests:write`, `checks:write`
- **Organization permissions**: `members:read`
- **Account permissions**: `email:read`

### Webhook Events
Subscribe to these webhook events:
- `installation`, `installation_repositories`
- `marketplace_purchase`
- `issues`, `issue_comment`
- `pull_request`, `pull_request_review`
- `workflow_run`, `check_run`, `check_suite`

## 💬 Copilot Commands

### 🧠 AI Code Analysis & Fixing
```
@codxcd Fix this entire repository
@codxcd Fix security issues in src/auth/
@codxcd Optimize performance in this project
@codxcd Modernize this codebase to ES2023
@codxcd Refactor complex functions
@codxcd Add documentation to all functions
```

### Time Tracking
```
@codxcd Start timer for issue #123
@codxcd Stop timer for issue #123
@codxcd Show my time report for this week
```

### Testing
```
@codxcd Run tests for my PR
@codxcd Run security tests on main branch
@codxcd Check test coverage for src/components
```

### Security
```
@codxcd Check security alerts
@codxcd Scan for vulnerabilities
@codxcd Fix security issue CVE-2024-1234
```

### Deployments
```
@codxcd Deploy to staging
@codxcd Deploy main branch to production
@codxcd Check deployment status
@codxcd Rollback last deployment
```

### Project Management
```
@codxcd Create issue for login bug
@codxcd Move issue #123 to in progress
@codxcd Show project roadmap
```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **GitHub App**: Handles webhooks and API interactions
- **Copilot Integration**: Processes chat messages and responds with actions
- **AI Code Assistant**: Advanced code analysis and fixing capabilities
- **Database**: Stores user data, time entries, and configuration
- **Authentication**: JWT-based auth with GitHub OAuth

### Frontend (React/TypeScript)
- **Dashboard**: Modern, responsive UI with real-time updates
- **Components**: Reusable UI components with Framer Motion animations
- **State Management**: React Query for server state management
- **Styling**: Tailwind CSS with custom design system

### Key Components
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── server/             # Backend API and webhook handlers
│   ├── services/       # AI code analysis and fixing services
│   ├── routes/         # API routes and Copilot integration
│   └── utils/          # Utility functions and helpers
└── types/              # TypeScript type definitions
```

## 🤖 AI Code Fixing Features

### Intelligent Analysis
- **Security Vulnerabilities**: SQL injection, XSS, hardcoded secrets
- **Bug Patterns**: Null pointer risks, infinite loops, logic errors
- **Performance Issues**: Inefficient algorithms, memory leaks
- **Code Quality**: Style violations, missing documentation
- **Complexity Analysis**: Cyclomatic complexity, maintainability metrics

### Automated Fixes
- **Human-Like Code**: Maintains your project's coding style and conventions
- **Comprehensive Coverage**: Fixes multiple issue types in a single pass
- **Safe Transformations**: Preserves functionality while improving code
- **Detailed Documentation**: Every fix includes explanation and reasoning
- **Pull Request Integration**: Creates professional PRs with detailed descriptions

### Example Fix Types
```javascript
// Before: Security vulnerability
const query = "SELECT * FROM users WHERE id = " + userId;

// After: Parameterized query
const query = "SELECT * FROM users WHERE id = ?";
const result = await db.query(query, [userId]);
```

```javascript
// Before: Performance issue
for (let i = 0; i < array.length; i++) {
  // Process array
}

// After: Optimized loop
for (let i = 0, len = array.length; i < len; i++) {
  // Process array
}
```

## 💰 Pricing Plans

### Free Plan
- Up to 3 repositories
- Basic time tracking
- Issue management
- GitHub integration
- Community support
- 50 CI/CD runs per month
- Basic code analysis

### Pro Plan ($29/user/month)
- Unlimited repositories
- **AI code fixing and analysis**
- Advanced time tracking & reports
- Security vulnerability scanning
- Automated deployments
- Project roadmaps
- Priority support
- Unlimited CI/CD runs
- Custom integrations

### Enterprise Plan (Custom)
- Everything in Pro
- SSO & SAML integration
- Advanced security controls
- Custom workflows
- Dedicated support
- SLA guarantees
- On-premise deployment

## 🔒 Security

- All data is encrypted in transit and at rest
- GitHub tokens are securely stored and never logged
- Regular security audits and vulnerability scanning
- Compliance with GitHub's security requirements
- Optional on-premise deployment for Enterprise customers

## 📖 API Documentation

### Webhook Endpoints
- `POST /api/webhooks` - GitHub webhook receiver
- `GET /health` - Health check endpoint

### Copilot Endpoints
- `POST /api/copilot/chat` - Process Copilot chat messages
- `GET /api/copilot/capabilities` - Get extension capabilities

### AI Code Assistant Endpoints
- `POST /api/ai/analyze` - Analyze repository code
- `POST /api/ai/fix` - Fix code issues automatically
- `POST /api/ai/optimize` - Optimize performance
- `POST /api/ai/modernize` - Modernize codebase

### Data Endpoints
- `GET /api/repositories` - Get user repositories
- `GET /api/stats` - Get dashboard statistics
- `POST /api/time-tracking/start` - Start time tracking
- `POST /api/time-tracking/stop` - Stop time tracking

## 🧪 Development

### Running Locally
```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure
- `/src/components` - React components
- `/src/pages` - Application pages
- `/src/server` - Backend API code
- `/src/server/services` - AI code analysis services
- `/src/utils` - Utility functions
- `/public` - Static assets

## 🚀 Deployment

### Quick Deploy Options
1. **Vercel**: One-click deploy with GitHub integration
2. **Railway**: Simple deployment with database included
3. **Docker**: Full containerized deployment
4. **GitHub Actions**: Automated CI/CD pipeline

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.codxcd.com](https://docs.codxcd.com)
- **Community**: [GitHub Discussions](https://github.com/codxcd/codxcd/discussions)
- **Email**: support@codxcd.com
- **Priority Support**: Available for Pro and Enterprise customers

## 🗺️ Roadmap

- [x] **AI Code Analysis & Fixing** - Intelligent repository-wide code improvements
- [ ] Advanced AI code review capabilities
- [ ] Integration with Slack and Microsoft Teams
- [ ] Custom workflow templates
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Multi-cloud deployment support

---

Built with ❤️ for the developer community. CodXCD makes DevOps workflows intelligent, automated, and delightful.