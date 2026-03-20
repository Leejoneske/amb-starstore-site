
-- Drop all triggers first
DROP TRIGGER IF EXISTS update_ambassador_stats_trigger ON transactions;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON ambassador_profiles;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON profiles;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON withdrawal_requests;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON payout_methods;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON profiles;

-- Drop all tables (order matters for foreign keys)
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS message_events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS starstore_transactions_cache CASCADE;
DROP TABLE IF EXISTS starstore_referrals_cache CASCADE;
DROP TABLE IF EXISTS starstore_users_cache CASCADE;
DROP TABLE IF EXISTS starstore_analytics_cache CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS payout_methods CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS ambassador_emails CASCADE;
DROP TABLE IF EXISTS ambassador_profiles CASCADE;
DROP TABLE IF EXISTS tier_configs CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.calculate_tier(integer) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_tier(integer, numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS public.update_application_as_admin(uuid, text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_as_admin(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_ambassador_as_admin(uuid, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_withdrawal_request(uuid, numeric, text, jsonb, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.process_withdrawal_request(uuid, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.disconnect_ambassador_telegram() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_first_login(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_ambassador_telegram_info(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.update_ambassador_stats() CASCADE;
DROP FUNCTION IF EXISTS public.assign_admin_role() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_min_withdrawal_amount(text) CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.app_tier CASCADE;
DROP TYPE IF EXISTS public.message_priority CASCADE;
DROP TYPE IF EXISTS public.message_status CASCADE;
DROP TYPE IF EXISTS public.message_type CASCADE;
DROP TYPE IF EXISTS public.payout_status CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;
