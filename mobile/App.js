import React, { useRef, Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { useNotifications } from './src/hooks/useNotifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#115E59', marginBottom: 10 }}>WorkOnTap</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>Something went wrong. Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user } = useAuth();
  const navigationRef = useRef();

  useNotifications(navigationRef, user?.role);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

