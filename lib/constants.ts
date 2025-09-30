// Default environment variables
export const DEFAULT_ENV = {
  MONGODB_URI: 'mongodb://localhost:27017/resume-generator',
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: '7d',
  OPENAI_API_KEY: '',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'your-nextauth-secret-key',
  NODE_ENV: 'development',
} as const;

// Get environment variable with fallback to default
export const getEnvVar = (key: keyof typeof DEFAULT_ENV): string => {
  return process.env[key] || DEFAULT_ENV[key];
};

// Database configuration
export const DB_CONFIG = {
  uri: getEnvVar('MONGODB_URI'),
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
} as const;

// JWT configuration
export const JWT_CONFIG = {
  secret: getEnvVar('JWT_SECRET'),
  expiresIn: getEnvVar('JWT_EXPIRES_IN'),
} as const;

// OpenAI configuration
export const OPENAI_CONFIG = {
  apiKey: getEnvVar('OPENAI_API_KEY'),
  model: 'gpt-5', // Latest OpenAI model with improved performance
  max_completion_tokens: 30000, // Increased for longer, more detailed resumes
  temperature: 0.7, // Good balance for creativity and consistency
  top_p: 0.9, // More focused than 1.0 for better quality
} as const;

// Application configuration
export const APP_CONFIG = {
  name: 'Resume Generator',
  version: '1.0.0',
  description: 'AI-powered resume generator using OpenAI',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: ['pdf', 'docx'],
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
  },
  RESUMES: {
    GENERATE: '/api/resumes/generate',
    LIST: '/api/resumes/list',
    DOWNLOAD: '/api/resumes/download',
    DELETE: '/api/resumes/delete',
  },
} as const;

// Theme configuration
export const THEME_CONFIG = {
  default: 'light',
  storageKey: 'resume-generator-theme',
} as const;
