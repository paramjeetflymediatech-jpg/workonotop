import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import CustomHeader from '../components/CustomHeader';
import CustomTabBar from '../components/CustomTabBar';

// Screens
import CustomerDashboard from '../screens/CustomerDashboard';
import ProviderDashboard from '../screens/ProviderDashboard';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { user } = useAuth();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} role={user?.role} />}
            screenOptions={{
                headerShown: false, // Changed: Let screens handle their own headers or use the drawer header
            }}
        >
            {/* Common first tab, but component changes by role */}
            <Tab.Screen
                name="Dashboard"
                component={
                    user?.role === 'provider' ? ProviderDashboard :
                        CustomerDashboard
                }
                options={{
                    title: user?.role === 'provider' ? 'Pro Dashboard' :
                        'WorkOnTop'
                }}
            />

            {/* Role-specific middle tab */}
            {user?.role === 'provider' ? (
                <Tab.Screen
                    name="Jobs"
                    component={ServicesScreen} // Placeholder for Provider Jobs
                    options={{ title: 'My Jobs' }}
                />
            ) : (
                <Tab.Screen
                    name="Services"
                    component={ServicesScreen}
                    options={{ title: 'Services' }}
                />
            )}

            {/* Common last tab */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
