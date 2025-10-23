-- Fix message table permissions for testing
-- Run this in Supabase SQL Editor to fix the RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users to read attachments" ON message_attachments;
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON message_events;
DROP POLICY IF EXISTS "Allow authenticated users to read active templates" ON message_templates;

-- Create more permissive policies for testing
CREATE POLICY "Allow all authenticated users full access to messages" ON messages
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users full access to attachments" ON message_attachments
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users full access to events" ON message_events
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users full access to templates" ON message_templates
  FOR ALL TO authenticated USING (true);

-- Also ensure service role has full access
CREATE POLICY "Service role full access to messages" ON messages
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to attachments" ON message_attachments
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to events" ON message_events
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to templates" ON message_templates
  FOR ALL TO service_role USING (true);