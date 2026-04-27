import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const DrawerItem = ({ label, icon, onPress, active, isLocked }) => (
    <TouchableOpacity
        style={[styles.drawerItem, active && styles.activeDrawerItem, isLocked && styles.lockedItem]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={icon}
            size={moderateScale(22)}
            color={active ? '#15843E' : isLocked ? '#94a3b8' : '#64748b'}
            style={styles.drawerIcon}
        />
        <Text style={[styles.drawerLabel, active && styles.activeDrawerLabel, isLocked && styles.lockedLabel]}>
            {label}
        </Text>
        {isLocked && (
            <Ionicons name="lock-closed" size={moderateScale(14)} color="#94a3b8" style={{ marginLeft: 'auto' }} />
        )}
    </TouchableOpacity>
);

const CustomDrawerContent = (props) => {
    const { user, logout } = useAuth();
    const currentRoute = props.state.routes[props.state.index].name;

    const adminMenuItems = [
        { label: 'Dashboard', icon: 'grid-outline', route: 'AdminHome' },
        { label: 'Job Requests', icon: 'document-text-outline', route: 'Job Requests' },
        { label: 'Users', icon: 'people-outline', route: 'Users' },
        { label: 'Providers', icon: 'construct-outline', route: 'Providers' },
        { label: 'Categories', icon: 'list-outline', route: 'Categories' },
        { label: 'Services', icon: 'settings-outline', route: 'ServicesList' },
        { label: 'Reviews', icon: 'star-outline', route: 'Reviews' },
        { label: 'Analytics', icon: 'bar-chart-outline', route: 'Analytics' },
        { label: 'Earnings', icon: 'wallet-outline', route: 'Earnings' },
        { label: 'Disputes', icon: 'alert-circle-outline', route: 'Disputes' },
        { label: 'Deletion Requests', icon: 'trash-outline', route: 'DeletionRequests' },
        { label: 'Commission Setup', icon: 'pie-chart-outline', route: 'CommissionSetup' },
        { label: 'Settings', icon: 'options-outline', route: 'Settings' },
    ];

    const providerMenuItems = [
        { label: 'Dashboard', icon: 'home-outline', route: 'Dashboard' },
        { label: 'Available Jobs', icon: 'search-outline', route: 'AvailableJobs' },
        { label: 'My Jobs', icon: 'briefcase-outline', route: 'MyJobs' },
        { label: 'Messages', icon: 'chatbubbles-outline', route: 'Messages' },
        { label: 'Earnings', icon: 'wallet-outline', route: 'Earnings' },
        { label: 'Ratings', icon: 'star-half-outline', route: 'Ratings' },
        { label: 'Profile', icon: 'person-outline', route: 'Profile' },
    ];

    const stripeConnected = user?.role === 'provider' && (user?.stripe_onboarding_complete == 1 || user?.stripe_onboarding_complete === true || user?.stripe_onboarding_complete === '1');
    const restrictedPaths = ['Messages', 'Earnings'];

    const menuItems = user?.role === 'admin' ? adminMenuItems : (user?.role === 'provider' ? providerMenuItems : []);

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogoutPress = () => setLogoutModalVisible(true);
    const handleLogoutCancel = () => setLogoutModalVisible(false);
    const handleLogoutConfirm = () => {
        setLogoutModalVisible(false);
        logout();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTextBold}>WORK</Text>
                    <Text style={styles.logoText}>ON TOP</Text>
                </View>
            </View>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                <View style={styles.menuContainer}>
                    {user?.role === 'provider' && !stripeConnected && (
                        <View style={styles.stripeNotice}>
                            <View style={styles.stripeHeader}>
                                <Ionicons name="alert-circle" size={moderateScale(16)} color="#b45309" />
                                <Text style={styles.stripeTitle}>Stripe not connected</Text>
                            </View>
                            <TouchableOpacity onPress={() => props.navigation.navigate('BankLink')}>
                                <Text style={styles.stripeLink}>Connect now →</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {menuItems.map((item, index) => {
                        const isLocked = user?.role === 'provider' && !stripeConnected && restrictedPaths.includes(item.route);
                        return (
                            <DrawerItem
                                key={index}
                                label={item.label}
                                icon={item.icon}
                                active={currentRoute === item.route}
                                isLocked={isLocked}
                                onPress={() => {
                                    if (isLocked) {
                                        Alert.alert(
                                            'Stripe Required',
                                            'Please connect your Stripe account to access this feature.',
                                            [
                                                { text: 'Later', style: 'cancel' },
                                                { text: 'Connect Now', onPress: () => props.navigation.navigate('BankLink') }
                                            ]
                                        );
                                    } else {
                                        props.navigation.navigate(item.route);
                                    }
                                }}
                            />
                        );
                    })}
                </View>
            </DrawerContentScrollView>
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.logoutButton} 
                    onPress={handleLogoutPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ef4444" />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>
            <LogoutConfirmationModal
                visible={logoutModalVisible}
                onCancel={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: moderateScale(5),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: verticalScale(10),
        marginTop: verticalScale(10),
    },
    logoContainer: {
        marginBottom: verticalScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logoTextBold: {
        fontSize: moderateScale(22),
        fontWeight: '900',
        color: '#15843E', // New Green Theme
        letterSpacing: 1.5,

        marginTop: verticalScale(12),
    },
    logoText: {
        fontSize: moderateScale(22),
        fontWeight: '400',
        color: '#15843E',
        marginLeft: scale(8),
        letterSpacing: 1.5,
        marginTop: verticalScale(12),

    },
    drawerContent: {
        paddingTop: 0,
    },
    menuContainer: {
        padding: moderateScale(10),
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(5),
    },
    activeDrawerItem: {
        backgroundColor: '#f0fdfa',
    },
    drawerIcon: {
        marginRight: scale(12),
    },
    drawerLabel: {
        fontSize: moderateScale(16),
        color: '#475569',
        fontWeight: '500',
    },
    activeDrawerLabel: {
        color: '#15843E',
        fontWeight: '700',
    },
    footer: {
        padding: moderateScale(15),
        paddingBottom: verticalScale(20), // Added bottom padding for home indicators
        paddingLeft: moderateScale(25),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    logoutText: {
        marginLeft: scale(12),
        fontSize: moderateScale(16),
        color: '#ef4444',
        fontWeight: '600',
    },
    stripeNotice: {
        backgroundColor: '#fffbeb',
        margin: moderateScale(10),
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    stripeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    stripeTitle: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#92400e',
        marginLeft: scale(6),
    },
    stripeLink: {
        fontSize: moderateScale(12),
        color: '#b45309',
        textDecorationLine: 'underline',
        fontWeight: '600',
        marginLeft: scale(22),
    },
    lockedItem: {
        opacity: 0.6,
    },
    lockedLabel: {
        color: '#94a3b8',
    }
});

export default CustomDrawerContent;
