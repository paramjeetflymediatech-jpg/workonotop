import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
import ProviderSignupScreen from '../screens/auth/ProviderSignupScreen';
import CustomerSignupScreen from '../screens/auth/CustomerSignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AdminDashboard from '../screens/AdminDashboard';
import CustomerDashboard from '../screens/CustomerDashboard';
import ProviderDashboard from '../screens/ProviderDashboard';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user } = useAuth();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#14b8a6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {user ? (
                <>
                    <Stack.Screen
                        name="Home"
                        component={
                            user.role === 'admin' ? AdminDashboard :
                                user.role === 'provider' ? ProviderDashboard :
                                    CustomerDashboard
                        }
                        options={{
                            title: user.role === 'admin' ? 'Admin Panel' :
                                user.role === 'provider' ? 'Pro Dashboard' :
                                    'WorkOnTop'
                        }}
                    />
                    <Stack.Screen name="Details" component={DetailsScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Our Services' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
