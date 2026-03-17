import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import OfflineScreen from './src/components/OfflineScreen';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Monitor network state
    const unsubscribe = NetInfo.addEventListener(state => {
      // isConnected can be null during initialization, treat as true to avoid flickering
      setIsConnected(state.isConnected !== false);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return (
      <SafeAreaProvider>
        <OfflineScreen onRetry={() => {
          NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected !== false);
          });
        }} />
      </SafeAreaProvider>
    );
  }

  if (showWelcome) {
    return (
      <SafeAreaProvider>
        <WelcomeScreen onFinish={() => setShowWelcome(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
