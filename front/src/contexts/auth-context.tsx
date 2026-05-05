import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import http from '@/lib/http';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await http.get<User>('/auth/me');
        return (response.data as any)?.data || response.data || null;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await http.post('/auth/login', { email, password });
      return response.data;
    },
    onSuccess: async () => {
      const { data: userData } = await refetchUser();
      if (userData) {
        toast.success('Login successful');
        navigate('/');
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please try again.';
      toast.error(errorMessage);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      // Even if logout fails, clear local state
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      const errorMessage =
        error.response?.data?.message || error.message || 'Logout failed';
      toast.error(errorMessage);
      navigate('/login');
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
