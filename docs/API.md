# CodXCD API Documentation

This document describes the CodXCD API endpoints for integration and development.

## Base URL

- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.codxcd.com/api`

## Authentication

CodXCD uses GitHub App authentication for API access. Include the installation access token in the Authorization header:

```bash
Authorization: Bearer <installation_access_token>
```

## Endpoints

### Copilot Extension

#### POST /copilot/chat

Process Copilot chat messages and return responses.

**Request:**
```json
{
  "message": "Start timer for issue #123",
  "context": {
    "repository": "owner/repo",
    "user": "username",
    "issue": 123
  }
}
```

**Response:**
```json
{
  "type": "markdown",
  "content": "⏰ Timer started for issue #123...",
  "references": [
    {
      "type": "issue",
      "url": "https://github.com/owner/repo/issues/123",
      "title": "Issue #123"
    }
  ],
  "suggestions": [
    "Stop timer for issue #123",
    "Show time report"
  ]
}
```

#### GET /copilot/capabilities

Get extension capabilities and command examples.

**Response:**
```json
{
  "name": "CodXCD DevOps Copilot",
  "description": "AI-powered DevOps assistant...",
  "capabilities": [...],
  "examples": [...],
  "pricing": {...}
}
```

### Repositories

#### GET /repositories

Get user's accessible repositories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "web-app",
    "full_name": "company/web-app",
    "description": "Main web application",
    "language": "TypeScript",
    "stars": 125,
    "forks": 32,
    "open_issues": 12,
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Dashboard Statistics

#### GET /stats

Get dashboard overview statistics.

**Response:**
```json
{
  "activeIssues": 24,
  "securityAlerts": 3,
  "deploymentsToday": 12,
  "timeTrackedThisWeek": 142,
  "totalRepositories": 8,
  "teamMembers": 12
}
```

### Time Tracking

#### POST /time-tracking/start

Start time tracking for an issue.

**Request:**
```json
{
  "issueNumber": 123,
  "repository": "owner/repo"
}
```

**Response:**
```json
{
  "id": 1641234567890,
  "issueNumber": 123,
  "repository": "owner/repo",
  "startTime": "2024-01-15T10:30:00Z",
  "status": "active"
}
```

#### POST /time-tracking/stop

Stop time tracking for an entry.

**Request:**
```json
{
  "entryId": 1641234567890
}
```

**Response:**
```json
{
  "id": 1641234567890,
  "endTime": "2024-01-15T12:30:00Z",
  "duration": 7200,
  "status": "completed"
}
```

#### GET /time-tracking/entries

Get time tracking entries.

**Query Parameters:**
- `repository` (optional): Filter by repository
- `user` (optional): Filter by user
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)
- `limit` (optional): Number of entries to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "entries": [
    {
      "id": 1,
      "issueNumber": 123,
      "repository": "owner/repo",
      "user": "username",
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T12:30:00Z",
      "duration": 7200,
      "status": "completed"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

### Security

#### GET /security/alerts

Get security alerts for repositories.

**Query Parameters:**
- `repository` (optional): Filter by repository
- `severity` (optional): Filter by severity (critical, high, medium, low)
- `status` (optional): Filter by status (open, resolved)

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "title": "High severity vulnerability in express",
      "description": "Prototype pollution vulnerability...",
      "severity": "high",
      "repository": "owner/repo",
      "file": "package.json",
      "introduced": "2024-01-15",
      "status": "open",
      "cveId": "CVE-2024-1234",
      "fixAvailable": true
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3
  }
}
```

#### POST /security/scan

Trigger security scan for a repository.

**Request:**
```json
{
  "repository": "owner/repo",
  "scanType": "full" // or "dependencies", "secrets", "code"
}
```

**Response:**
```json
{
  "scanId": "scan_123456",
  "status": "initiated",
  "estimatedCompletion": "2024-01-15T10:35:00Z"
}
```

### Deployments

#### GET /deployments

Get deployment history.

**Query Parameters:**
- `repository` (optional): Filter by repository
- `environment` (optional): Filter by environment
- `status` (optional): Filter by status
- `limit` (optional): Number of deployments to return

**Response:**
```json
{
  "deployments": [
    {
      "id": 1,
      "repository": "owner/repo",
      "environment": "production",
      "branch": "main",
      "commit": "a1b2c3d",
      "status": "success",
      "deployedAt": "2024-01-15T10:30:00Z",
      "deployedBy": "username",
      "duration": 135
    }
  ]
}
```

#### POST /deployments

Create a new deployment.

**Request:**
```json
{
  "repository": "owner/repo",
  "environment": "staging",
  "branch": "main",
  "commit": "a1b2c3d"
}
```

**Response:**
```json
{
  "id": 123,
  "status": "initiated",
  "deploymentUrl": "https://github.com/owner/repo/deployments/123"
}
```

### Projects

#### GET /projects

Get project information.

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Web Application",
      "description": "Main customer-facing web application",
      "repository": "company/web-app",
      "status": "active",
      "progress": 75,
      "issues": 12,
      "prs": 3,
      "team": 5,
      "lastActivity": "2024-01-15T08:30:00Z"
    }
  ]
}
```

#### GET /projects/:id/roadmap

Get project roadmap and milestones.

**Response:**
```json
{
  "milestones": [
    {
      "id": 1,
      "title": "v1.3.0 Release",
      "description": "Authentication improvements and performance optimizations",
      "dueDate": "2024-03-15",
      "progress": 65,
      "issues": {
        "open": 8,
        "closed": 15
      }
    }
  ],
  "sprints": [
    {
      "id": 12,
      "name": "Sprint 12",
      "startDate": "2024-01-01",
      "endDate": "2024-01-14",
      "status": "active",
      "progress": 65,
      "velocity": 23
    }
  ]
}
```

### Code Search

#### POST /search/semantic

Perform semantic code search.

**Request:**
```json
{
  "query": "authentication logic",
  "repository": "owner/repo",
  "language": "javascript",
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "file": "src/auth/middleware.js",
      "line": 23,
      "content": "export const authenticateUser = async (req, res, next) => {",
      "context": "...",
      "relevanceScore": 0.94
    }
  ],
  "searchTime": 0.3,
  "totalResults": 8
}
```

### Webhooks

#### POST /webhooks

GitHub webhook endpoint (internal use).

**Headers:**
- `X-GitHub-Event`: Event type
- `X-GitHub-Delivery`: Delivery ID
- `X-Hub-Signature-256`: Webhook signature

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited:

- **Authenticated requests:** 5000 requests per hour
- **Webhook endpoints:** No rate limit
- **Search endpoints:** 100 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1641234567
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @codxcd/sdk
```

```javascript
import { CodXCDClient } from '@codxcd/sdk';

const client = new CodXCDClient({
  token: 'your_access_token',
  baseUrl: 'https://api.codxcd.com'
});

// Start time tracking
await client.timeTracking.start({
  issueNumber: 123,
  repository: 'owner/repo'
});
```

### Python

```bash
pip install codxcd-python
```

```python
from codxcd import CodXCDClient

client = CodXCDClient(
    token='your_access_token',
    base_url='https://api.codxcd.com'
)

# Get security alerts
alerts = client.security.get_alerts(repository='owner/repo')
```

## Webhooks

CodXCD can send webhooks for various events:

### Configuration

Configure webhook URLs in the dashboard or via API:

```json
{
  "url": "https://your-app.com/webhooks/codxcd",
  "secret": "your_webhook_secret",
  "events": ["time_tracking.started", "deployment.completed"]
}
```

### Events

- `time_tracking.started` - Time tracking started
- `time_tracking.stopped` - Time tracking stopped
- `security.alert_created` - New security alert
- `deployment.started` - Deployment initiated
- `deployment.completed` - Deployment finished
- `test.completed` - Test suite finished

### Payload Example

```json
{
  "event": "time_tracking.started",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": 123,
    "issueNumber": 456,
    "repository": "owner/repo",
    "user": "username"
  }
}
```

## Support

For API support and questions:

- **Documentation:** [docs.codxcd.com/api](https://docs.codxcd.com/api)
- **GitHub Issues:** [github.com/codxcd/codxcd/issues](https://github.com/codxcd/codxcd/issues)
- **Email:** api-support@codxcd.com