-- Fix for existing users who don't have user_settings
-- Run this AFTER running supabase-setup.sql

-- Insert user_settings for all existing users who don't have them
INSERT INTO user_settings (user_id, dark_mode, notifications_enabled)
SELECT 
  id as user_id,
  false as dark_mode,
  true as notifications_enabled
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;
