import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  firstLogin: (email: string, tempPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Handle NEW_PASSWORD_REQUIRED challenge
      if (response.data.challenge === 'NEW_PASSWORD_REQUIRED') {
        toast.info('Please set a new password');
        navigate('/first-login', { state: { email, tempPassword: password, session: response.data.session } });
        return;
      }

      const { accessToken, refreshToken, idToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (idToken) localStorage.setItem('idToken', idToken);
      
      // Fetch user data
      const userResponse = await api.get('/me');
      setUser(userResponse.data);
      
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await api.post('/auth/register', { email, password, name });
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const firstLogin = async (email: string, tempPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/first-login', {
        email,
        tempPassword,
        newPassword,
      });

      const { accessToken, refreshToken, idToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (idToken) localStorage.setItem('idToken', idToken);
      
      // Fetch user data
      const userResponse = await api.get('/me');
      setUser(userResponse.data);
      
      toast.success('Password updated successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password update failed');
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset code sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
      throw error;
    }
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await api.post('/auth/forgot-password/confirm', { email, confirmationCode: code, newPassword });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        firstLogin,
        forgotPassword,
        confirmForgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
