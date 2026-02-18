



'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'provider'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Check for customer first
    const savedCustomer = localStorage.getItem('workontap_user');
    if (savedCustomer) {
      setUser(JSON.parse(savedCustomer));
      setUserType('customer');
      setLoading(false);
      return;
    }

    // Check for provider
    const savedProvider = localStorage.getItem('provider');
    const providerToken = localStorage.getItem('providerToken');
    
    if (savedProvider && providerToken) {
      setUser(JSON.parse(savedProvider));
      setUserType('provider');
    }
    
    setLoading(false);
  };

  const login = (userData, type = 'customer') => {
    setUser(userData);
    setUserType(type);
    
    if (type === 'customer') {
      localStorage.setItem('workontap_user', JSON.stringify(userData));
      // Clear provider data if exists
      localStorage.removeItem('provider');
      localStorage.removeItem('providerToken');
    } else if (type === 'provider') {
      localStorage.setItem('provider', JSON.stringify(userData));
      // Clear customer data if exists
      localStorage.removeItem('workontap_user');
    }
  };

  const logout = (redirect = true) => {
    setUser(null);
    setUserType(null);
    
    // Clear all auth data
    localStorage.removeItem('workontap_user');
    localStorage.removeItem('provider');
    localStorage.removeItem('providerToken');
    
    if (redirect) {
      router.push('/');
    }
  };

  // Helper to check if user is provider
  const isProvider = () => {
    return userType === 'provider';
  };

  // Helper to check if user is customer
  const isCustomer = () => {
    return userType === 'customer';
  };

  // Get dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return '/';
    return isProvider() ? '/provider/dashboard' : '/my-bookings';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    if (isProvider()) {
      // Provider format
      return user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    } else {
      // Customer format
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (isProvider()) {
      if (user.name) return user.name[0];
      if (user.first_name) return user.first_name[0];
    } else {
      if (user.first_name) return user.first_name[0];
      if (user.last_name) return user.last_name[0];
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userType,
      loading, 
      login, 
      logout,
      isProvider,
      isCustomer,
      getDashboardLink,
      getUserDisplayName,
      getUserInitials
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}