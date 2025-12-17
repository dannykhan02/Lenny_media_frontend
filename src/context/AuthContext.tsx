import { createContext } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminExists: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>; // Changed from Promise<void> to Promise<boolean>
  registerFirstAdmin: (email: string, password: string, full_name: string) => Promise<void>;
  checkAdminExists: () => Promise<void>;
  error: string | null;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);