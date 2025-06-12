import Joi from 'joi';

const configSchema = Joi.object({
  github: Joi.object({
    appId: Joi.string().required(),
    privateKey: Joi.string().required(),
    webhookSecret: Joi.string().required(),
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required()
  }).required(),
  database: Joi.object({
    user: Joi.string().required(),
    host: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    port: Joi.number().default(5432)
  }).required(),
  app: Joi.object({
    port: Joi.number().default(3000),
    nodeEnv: Joi.string().valid('development', 'production', 'test').default('development'),
    url: Joi.string().uri().required()
  }).required(),
  stripe: Joi.object({
    secretKey: Joi.string().required(),
    webhookSecret: Joi.string().required()
  }).required(),
  jwt: Joi.object({
    secret: Joi.string().required(),
    expiresIn: Joi.string().default('24h')
  }).required()
});

export const validateConfig = () => {
  const config = {
    github: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    },
    database: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432')
    },
    app: {
      port: parseInt(process.env.PORT || '3000'),
      nodeEnv: process.env.NODE_ENV || 'development',
      url: process.env.APP_URL || 'http://localhost:5173'
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  };

  const { error, value } = configSchema.validate(config);
  
  if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }

  return value;
};

// Export validated config or default values for development
export const config = process.env.NODE_ENV === 'production'
  ? validateConfig()
  : {
      github: {
        appId: process.env.GITHUB_APP_ID || '',
        privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
      },
      database: {
        user: process.env.DB_USER || 'your_db_user',
        host: process.env.DB_HOST || 'your_db_host',
        name: process.env.DB_NAME || 'your_db_name',
        password: process.env.DB_PASSWORD || 'your_db_password',
        port: parseInt(process.env.DB_PORT || '5432')
      },
      app: {
        port: parseInt(process.env.PORT || '3000'),
        nodeEnv: process.env.NODE_ENV || 'development',
        url: process.env.APP_URL || 'http://localhost:5173'
      },
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'development-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    };