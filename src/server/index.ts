import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import { createAppAuth } from '@octokit/auth-app';
import { App } from '@octokit/app';
import { Webhooks } from '@octokit/webhooks';
import { createLogger } from './utils/logger';
import { validateConfig } from './utils/config';
import webhookRoutes from './routes/webhooks';
import apiRoutes from './routes/api';
import copilotRoutes from './routes/copilot';
import authRouter from './routes/auth';
import subscriptionRouter from './routes/subscription';

dotenv.config();

const logger = createLogger();
const config = validateConfig();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.sessionSecret || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize GitHub App
const githubApp = new App({
  appId: config.github.appId,
  privateKey: config.github.privateKey,
  webhooks: {
    secret: config.github.webhookSecret
  }
});

// Initialize Webhooks
const webhooks = new Webhooks({
  secret: config.github.webhookSecret
});

// Make GitHub App and webhooks available to routes
app.locals.githubApp = githubApp;
app.locals.webhooks = webhooks;

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api', apiRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/auth', authRouter);
app.use('/subscription', subscriptionRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  logger.info(`CodXCD server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;