import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import OfflineScreen from './src/components/OfflineScreen';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { useNotifications } from './src/hooks/useNotifications';

import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppContent() {
  const { user } = useAuth();
  const navigationRef = useRef();

  useNotifications(navigationRef.current, user?.role);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
