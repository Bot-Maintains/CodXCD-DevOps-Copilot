declare namespace NodeJS {
  interface ProcessEnv {
    // Node environment
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;

    // Database configuration
    DB_USER?: string;
    DB_HOST?: string;
    DB_NAME?: string;
    DB_PASSWORD?: string;
    DB_PORT?: string;

    // Application configuration
    APP_URL?: string;

    // GitHub configuration
    GITHUB_APP_ID?: string;
    GITHUB_PRIVATE_KEY?: string;
    GITHUB_WEBHOOK_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;

    // Stripe configuration
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // JWT configuration
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
  }
}
