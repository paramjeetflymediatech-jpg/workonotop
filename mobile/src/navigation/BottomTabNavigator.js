import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import CustomHeader from '../components/CustomHeader';

// Screens
import AdminDashboard from '../screens/AdminDashboard';
import CustomerDashboard from '../screens/CustomerDashboard';
import ProviderDashboard from '../screens/ProviderDashboard';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { user } = useAuth();

    // Determine which dashboard to show based on user role
    const getDashboardComponent = () => {
        switch (user?.role) {
            case 'admin':
                return AdminDashboard;
            case 'provider':
                return ProviderDashboard;
            default:
                return CustomerDashboard;
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: ({ options }) => <CustomHeader title={options.title || route.name} />,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Services') {
                        iconName = focused ? 'construct' : 'construct-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#14b8a6',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={getDashboardComponent()}
                options={{
                    title: user?.role === 'admin' ? 'Admin Panel' :
                        user?.role === 'provider' ? 'Pro Dashboard' :
                            'WorkOnTop'
                }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesScreen}
                options={{ title: 'Our Services' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
