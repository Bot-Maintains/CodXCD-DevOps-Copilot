-- Create usage quotas table
CREATE TABLE IF NOT EXISTS user_quotas (
    user_login VARCHAR(255) PRIMARY KEY,
    ai_credits_used INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    team_seats_used INTEGER DEFAULT 0,
    last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_login) REFERENCES user_plans(user_login) ON DELETE CASCADE
);

-- Create feature trials table
CREATE TABLE IF NOT EXISTS feature_trials (
    id SERIAL PRIMARY KEY,
    user_login VARCHAR(255) NOT NULL,
    feature_id VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT true,
    FOREIGN KEY (user_login) REFERENCES user_plans(user_login) ON DELETE CASCADE,
    UNIQUE(user_login, feature_id)
);

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_user_quotas_reset_date ON user_quotas(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_feature_trials_user ON feature_trials(user_login);
CREATE INDEX IF NOT EXISTS idx_feature_trials_dates ON feature_trials(start_date, end_date);
