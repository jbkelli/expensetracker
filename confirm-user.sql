-- Manually confirm the existing user account
-- Run this in Supabase SQL Editor

UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = '444mwangialvinm@gmail.com';
