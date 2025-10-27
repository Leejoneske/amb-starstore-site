// Environment configuration with validation
interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    functionsUrl: string;
  };
  telegram: {
    botUsername: string;
    serverUrl: string;
    mongoConnectionString: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    debugMode: boolean;
  };
  features: {
    enableTelegramIntegration: boolean;
    enableAnalytics: boolean;
    enableRealTimeUpdates: boolean;
  };
}

// Validate required environment variables
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    // In production builds, we might have hardcoded fallbacks
    const fallbacks: Record<string, string> = {
      'VITE_SUPABASE_URL': 'https://jrtqbntwwkqxpexpplly.supabase.co',
      'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHFibnR3d2txeHBleHBwbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQ5NzEsImV4cCI6MjA3NTQ3MDk3MX0.eVCHDu9w_mOxE0PH_yb0lH1WpmZkmz6AKLC5XBbLeUE'
    };
    
    if (fallbacks[name]) {
      console.warn(`Using fallback for ${name}`);
      return fallbacks[name];
    }
    
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Get environment variable with fallback
function getEnvVar(name: string, fallback?: string): string {
  return import.meta.env[name] || fallback || '';
}

// Create configuration object
export const config: AppConfig = {
  supabase: {
    url: validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
    anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
    functionsUrl: getEnvVar('VITE_SUPABASE_FUNCTIONS_URL', 'https://jrtqbntwwkqxpexpplly.supabase.co/functions/v1'),
  },
  telegram: {
    botUsername: getEnvVar('VITE_TELEGRAM_BOT_USERNAME', 'your_bot'),
    serverUrl: getEnvVar('VITE_TELEGRAM_SERVER_URL', 'https://your-railway-app.railway.app'),
    mongoConnectionString: getEnvVar('VITE_MONGO_CONNECTION_STRING', ''),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Ambassador Dashboard'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: (getEnvVar('VITE_ENVIRONMENT', 'development') as AppConfig['app']['environment']),
    debugMode: import.meta.env.DEV,
  },
  features: {
    enableTelegramIntegration: getEnvVar('VITE_ENABLE_TELEGRAM', 'true') === 'true',
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
    enableRealTimeUpdates: getEnvVar('VITE_ENABLE_REALTIME', 'true') === 'true',
  },
};

// Utility functions
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isStaging = config.app.environment === 'staging';

// Feature flags
export const features = config.features;

// Admin configuration
export const ADMIN_EMAIL = 'johnwanderi202@gmail.com';

// Export individual configs for convenience
export const supabaseConfig = config.supabase;
export const telegramConfig = config.telegram;
export const appConfig = config.app;