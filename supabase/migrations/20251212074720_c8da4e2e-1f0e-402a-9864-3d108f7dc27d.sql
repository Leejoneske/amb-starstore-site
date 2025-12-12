-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule keep-alive ping every 5 minutes
SELECT cron.schedule(
  'keep-alive-ping',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jrtqbntwwkqxpexpplly.supabase.co/functions/v1/keep-alive',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHFibnR3d2txeHBleHBwbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQ5NzEsImV4cCI6MjA3NTQ3MDk3MX0.eVCHDu9w_mOxE0PH_yb0lH1WpmZkmz6AKLC5XBbLeUE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
