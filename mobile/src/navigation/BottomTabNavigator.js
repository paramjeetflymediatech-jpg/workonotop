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
import MyBookingsScreen from '../screens/customer/MyBookingsScreen';
import GuestPlaceholderScreen from '../screens/auth/GuestPlaceholderScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { user } = useAuth();
    const role = user?.role || 'customer';

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} role={role} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* Common first tab, but component changes by role */}
            <Tab.Screen
                name="Dashboard"
                component={
                    role === 'provider' ? ProviderDashboard :
                        CustomerDashboard
                }
                options={{
                    title: role === 'provider' ? 'Pro Dashboard' :
                        'WorkOnTop'
                }}
            />

            {/* Role-specific middle tab */}
            {role === 'provider' ? (
                <Tab.Screen
                    name="Jobs"
                    component={ServicesScreen} // Placeholder for Provider Jobs
                    options={{ title: 'My Jobs' }}
                />
            ) : (
                <>
                    <Tab.Screen
                        name="Services"
                        component={ServicesScreen}
                        options={{ title: 'Services' }}
                    />
                    <Tab.Screen
                        name="MyBookings"
                        component={user ? MyBookingsScreen : GuestPlaceholderScreen}
                        initialParams={!user ? {
                            title: 'Your Bookings',
                            description: 'Sign in to see your booking history and manage upcoming services.',
                            icon: 'calendar-outline'
                        } : undefined}
                        options={{ title: 'My Bookings' }}
                    />
                </>
            )}

            {/* Common last tab */}
            <Tab.Screen
                name="Profile"
                component={user ? ProfileScreen : GuestPlaceholderScreen}
                initialParams={!user ? {
                    title: 'Your Profile',
                    description: 'Sign in to update your profile, manage settings, and more.',
                    icon: 'person-outline'
                } : undefined}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
