import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole, AuthState, LoginResponse, RegisterRequest, UpdateProfileRequest } from '../types';
import { authApi } from '../api/authApi';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  userId?: string;
  name?: string;
  exp?: number;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterRequest) => Promise<User>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<User>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(() => {
    localStorage.removeItem('integrityai_token');
    localStorage.removeItem('integrityai_user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const initAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('integrityai_token');
      const savedUser = localStorage.getItem('integrityai_user');

      if (!token) {
        setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);

      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn('JWT token has expired');
        logout();
        return;
      }

      let user: User;
      if (savedUser) {
        user = JSON.parse(savedUser);
      } else {
        user = {
          userId: decoded.userId || '',
          email: decoded.sub || decoded.email || '',
          name: decoded.name || (decoded.sub ? decoded.sub.split('@')[0] : 'User'),
          role: (decoded.role?.toUpperCase() || 'STUDENT') as UserRole,
        };
      }

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to initialize auth from storage', err);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const data = await authApi.login(email, password);
    const token = data.token;
    localStorage.setItem('integrityai_token', token);

    const decoded = jwtDecode<JwtPayload>(token);

    const user: User = {
      userId: data.userId || decoded.userId || '',
      email: data.email || decoded.sub || email,
      name: data.name || decoded.name || email.split('@')[0],
      role: (data.role || decoded.role?.toUpperCase() || 'STUDENT') as UserRole,
      rollNumber: data.rollNumber,
      phoneNumber: data.phoneNumber,
      course: data.course,
      semester: data.semester,
      department: data.department,
      assignedCourses: data.assignedCourses,
    };

    localStorage.setItem('integrityai_user', JSON.stringify(user));

    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return data;
  };

  const register = async (payload: RegisterRequest): Promise<User> => {
    const user = await authApi.register(payload);
    return user;
  };

  const updateProfile = async (payload: UpdateProfileRequest): Promise<User> => {
    if (!authState.user?.userId) throw new Error('No authenticated user');
    const updated = await authApi.updateProfile(authState.user.userId, payload);
    const mergedUser = { ...authState.user, ...updated };
    setAuthState((prev) => ({
      ...prev,
      user: mergedUser,
    }));
    localStorage.setItem('integrityai_user', JSON.stringify(mergedUser));
    return mergedUser;
  };

  const refreshUserProfile = async () => {
    if (!authState.user?.userId) return;
    try {
      const freshUser = await authApi.getUserById(authState.user.userId);
      setAuthState((prev) => ({
        ...prev,
        user: { ...prev.user, ...freshUser },
      }));
      localStorage.setItem('integrityai_user', JSON.stringify({ ...authState.user, ...freshUser }));
    } catch (err) {
      console.warn('Could not refresh user profile details:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        updateProfile,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
