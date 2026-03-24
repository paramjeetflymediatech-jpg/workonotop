import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../components/CustomDrawerContent';

// Screens
import ProviderDashboard from '../screens/ProviderDashboard';
import ServicesScreen from '../screens/ServicesScreen';
import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
import MyJobsScreen from '../screens/contractor/MyJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EarningsScreen from '../screens/contractor/EarningsScreen';
import RatingsScreen from '../screens/contractor/RatingsScreen';
import ProviderMessagesScreen from '../screens/contractor/ProviderMessagesScreen';

const Drawer = createDrawerNavigator();

const ProviderDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '75%',
                    borderTopRightRadius: 25,
                    borderBottomRightRadius: 25,
                }
            }}
        >
            <Drawer.Screen name="Dashboard" component={ProviderDashboard} options={{ drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} /> }} />
            <Drawer.Screen name="AvailableJobs" component={ContractorJobsScreen} options={{ title: 'Available Jobs', drawerIcon: ({ color }) => <Ionicons name="search-outline" size={22} color={color} /> }} />
            <Drawer.Screen name="MyJobs" component={MyJobsScreen} options={{ title: 'My Jobs', drawerIcon: ({ color }) => <Ionicons name="briefcase-outline" size={22} color={color} /> }} />
            <Drawer.Screen name="Services" component={ServicesScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="construct-outline" size={22} color={color} /> }} />
            <Drawer.Screen name="Messages" component={ProviderMessagesScreen} />
            <Drawer.Screen name="Earnings" component={EarningsScreen} />
            <Drawer.Screen name="Ratings" component={RatingsScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
};

export default ProviderDrawerNavigator;
