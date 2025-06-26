import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app start
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Restored user from localStorage:', parsedUser);
        
        // Ensure user has an ID field
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
          apiClient.setAuthToken(token);
        } else {
          console.warn('User data missing ID field, clearing stored data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.signin(email, password);
      
      console.log('Login API response:', response);
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        console.log('Login successful, raw user data from API:', userData);
        
        // Extract user ID from the API response
        // The API might return the user data in different formats, so we need to handle various cases
        let userId = userData.id || userData.user_id || userData.userId;
        
        // If no ID in user data, try to extract from token or use email as fallback
        if (!userId) {
          console.warn('No user ID found in API response, using email as identifier');
          userId = userData.email || email;
        }
        
        // Create user object with proper structure
        const userObj: User = {
          id: userId,
          email: userData.email || email,
          name: userData.name || userData.full_name || '',
          profileImage: userData.profile_image_url || userData.profileImage || '/image-6.png'
        };
        
        console.log('Processed user object:', userObj);
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userObj));
        
        // Set auth token for future requests
        apiClient.setAuthToken(token);
        
        // Update state
        setUser(userObj);
        
        return true;
      }
      
      console.log('Login failed - no success or data in response');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', email);
      const response = await apiClient.signup(email, password);
      
      console.log('Registration API response:', response);
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        console.log('Registration successful, raw user data from API:', userData);
        
        // Extract user ID from the API response
        let userId = userData.id || userData.user_id || userData.userId;
        
        // If no ID in user data, try to extract from token or use email as fallback
        if (!userId) {
          console.warn('No user ID found in registration response, using email as identifier');
          userId = userData.email || email;
        }
        
        // Create user object with proper structure
        const userObj: User = {
          id: userId,
          email: userData.email || email,
          name: userData.name || userData.full_name || '',
          profileImage: userData.profile_image_url || userData.profileImage || '/image-6.png'
        };
        
        console.log('Processed user object from registration:', userObj);
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userObj));
        
        // Set auth token for future requests
        apiClient.setAuthToken(token);
        
        // Update state
        setUser(userObj);
        
        return true;
      }
      
      console.log('Registration failed - no success or data in response');
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Remove auth token from API client
    apiClient.removeAuthToken();
    
    // Update state
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
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