import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded publishable (anon) key + URL so the app boots on any host
// (e.g. Vercel) even without VITE_SUPABASE_* env vars configured.
// These are public values safe to ship in the frontend bundle.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://jrtqbntwwkqxpexpplly.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHFibnR3d2txeHBleHBwbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQ5NzEsImV4cCI6MjA3NTQ3MDk3MX0.eVCHDu9w_mOxE0PH_yb0lH1WpmZkmz6AKLC5XBbLeUE';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
