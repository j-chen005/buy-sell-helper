/**
 * Environment variables utility
 * Provides type-safe access to Vite environment variables
 */

export const env = {
  // API Configuration
  RAPID_API_HOST: import.meta.env.VITE_RAPID_API_HOST || '',
  RAPID_API_KEY: import.meta.env.VITE_RAPID_API_KEY || '',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_KEY || '',
  
  // Feature Flags
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Development helpers
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE
};

// Helper function to validate required environment variables
export function validateEnv() {
  const required = [
    'RAPID_API_HOST',
    'RAPID_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

// Export individual variables for convenience
export const {
  RAPID_API_HOST,
  RAPID_API_KEY,
  OPENAI_API_KEY,
  ENABLE_DEBUG_MODE,
  ENABLE_ANALYTICS,
  IS_DEV,
  IS_PROD,
  MODE
} = env;
