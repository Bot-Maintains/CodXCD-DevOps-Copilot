-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
    user_login VARCHAR(255) PRIMARY KEY,
    plan VARCHAR(20) NOT NULL DEFAULT 'free',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (plan IN ('free', 'pro', 'enterprise'))
);

-- Create index for faster lookups
CREATE INDEX idx_user_plans_login ON user_plans(user_login);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_plans_updated_at
    BEFORE UPDATE ON user_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
