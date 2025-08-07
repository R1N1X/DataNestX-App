import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean; }>;
  register: (email: string, password: string, name: string, role: 'buyer' | 'seller') => Promise<{ success: boolean; error?: string; requiresOtp?: boolean; }>;
  verifyOtp: (email: string, otpCode: string) => Promise<{ success: boolean; error?: string; }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string; }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (data: any): User => {
    const authenticatedUser: User = {
      id: data.user.id,
      _id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      avatarUrl: data.user.avatarUrl,
      rating: data.user.rating,
      totalDatasets: data.user.totalDatasets,
      totalPurchases: data.user.totalPurchases,
      totalEarnings: data.user.totalEarnings,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      
      return { success: true, requiresOtp: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'buyer' | 'seller') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      return { success: true, requiresOtp: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }
      
      handleAuthSuccess(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyOtp, 
      resendOtp, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
