import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_CONFIG } from './constants';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const token = jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  } as jwt.SignOptions);
  return token;
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_CONFIG.secret) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Extract token from Authorization header
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Middleware to verify JWT token
export const authenticateToken = (req: any): JWTPayload | null => {
  // Use .get() method for Headers object in Next.js
  const authHeader = req.headers.get('authorization');
  
  const token = extractToken(authHeader);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  
  return payload;
};
