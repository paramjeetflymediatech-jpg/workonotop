import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminDashboard from '../screens/admin/AdminDashboard';
import JobRequestsScreen from '../screens/admin/JobRequestsScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import ProvidersScreen from '../screens/admin/ProvidersScreen';
import CategoriesScreen from '../screens/admin/CategoriesScreen';
import ServicesListScreen from '../screens/admin/ServicesListScreen';
import ReviewsScreen from '../screens/admin/ReviewsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import EarningsScreen from '../screens/admin/EarningsScreen';
import DisputesScreen from '../screens/admin/DisputesScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import CommissionSetupScreen from '../screens/admin/CommissionSetupScreen';
import AdminDeletionRequestsScreen from '../screens/admin/AdminDeletionRequestsScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const AdminDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '70%',
                    borderTopRightRadius: 25,
                    borderBottomRightRadius: 25,
                }
            }}
        >
            <Drawer.Screen name="AdminHome" component={AdminDashboard} options={{ title: 'Dashboard' }} />
            <Drawer.Screen name="Job Requests" component={JobRequestsScreen} />
            <Drawer.Screen name="Users" component={UsersScreen} />
            <Drawer.Screen name="Providers" component={ProvidersScreen} />
            <Drawer.Screen name="Categories" component={CategoriesScreen} />
            <Drawer.Screen name="ServicesList" component={ServicesListScreen} />
            <Drawer.Screen name="Reviews" component={ReviewsScreen} />
            <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
            <Drawer.Screen name="Earnings" component={EarningsScreen} />
            <Drawer.Screen name="Disputes" component={DisputesScreen} />
            <Drawer.Screen name="DeletionRequests" component={AdminDeletionRequestsScreen} options={{ title: 'Deletion Requests' }} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="CommissionSetup" component={CommissionSetupScreen} options={{ title: 'Commission Setup' }} />
        </Drawer.Navigator>
    );
};

export default AdminDrawerNavigator;
