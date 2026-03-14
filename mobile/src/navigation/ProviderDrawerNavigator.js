import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/CustomDrawerContent';

// Screens
import ProviderDashboard from '../screens/ProviderDashboard';
import ServicesScreen from '../screens/ServicesScreen';
import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';

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
            <Drawer.Screen name="Dashboard" component={ProviderDashboard} />
            <Drawer.Screen name="Services" component={ServicesScreen} />
            <Drawer.Screen name="ContractorJobs" component={ContractorJobsScreen} />
            <Drawer.Screen name="Messages" component={PlaceholderScreen} initialParams={{ title: 'Messages' }} />
            <Drawer.Screen name="Earnings" component={PlaceholderScreen} initialParams={{ title: 'Earnings' }} />
            <Drawer.Screen name="Ratings" component={PlaceholderScreen} initialParams={{ title: 'Ratings' }} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
};

export default ProviderDrawerNavigator;
