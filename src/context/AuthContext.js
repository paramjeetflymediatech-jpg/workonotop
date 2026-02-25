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
      try {
        setUser(JSON.parse(savedCustomer));
        setUserType('customer');
        setLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing customer data:', e);
      }
    }

    // Check for provider
    const savedProvider = localStorage.getItem('provider');
    const providerToken = localStorage.getItem('providerToken');
    
    if (savedProvider && providerToken) {
      try {
        setUser(JSON.parse(savedProvider));
        setUserType('provider');
      } catch (e) {
        console.error('Error parsing provider data:', e);
      }
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
      // Store token if provided
      if (userData.token) {
        localStorage.setItem('providerToken', userData.token);
      }
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
      // Provider format - try different possible name fields
      return user.name || 
             user.business_name || 
             `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
             user.email || 
             'Provider';
    } else {
      // Customer format
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Customer';
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (isProvider()) {
      // Try to get initials from name
      if (user.name) return user.name.charAt(0).toUpperCase();
      if (user.first_name) return user.first_name.charAt(0).toUpperCase();
      if (user.business_name) return user.business_name.charAt(0).toUpperCase();
    } else {
      if (user.first_name) return user.first_name.charAt(0).toUpperCase();
      if (user.last_name) return user.last_name.charAt(0).toUpperCase();
    }
    
    // Fallback to email first character
    return user.email?.charAt(0)?.toUpperCase() || 'U';
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