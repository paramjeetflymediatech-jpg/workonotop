import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const DrawerItem = ({ label, icon, onPress, active }) => (
    <TouchableOpacity
        style={[styles.drawerItem, active && styles.activeDrawerItem]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={icon}
            size={moderateScale(22)}
            color={active ? '#115e59' : '#64748b'}
            style={styles.drawerIcon}
        />
        <Text style={[styles.drawerLabel, active && styles.activeDrawerLabel]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const CustomDrawerContent = (props) => {
    const { user, logout } = useAuth();
    const currentRoute = props.state.routes[props.state.index].name;

    const menuItems = [
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
        { label: 'Settings', icon: 'options-outline', route: 'Settings' },
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarInitial}>
                            {(user?.name || user?.email || 'A')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.name || user?.email?.split('@')[0] || 'Admin'}
                        </Text>
                        <Text style={styles.userRole}>Administrator</Text>
                    </View>
                </View>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <DrawerItem
                            key={index}
                            label={item.label}
                            icon={item.icon}
                            active={currentRoute === item.route}
                            onPress={() => props.navigation.navigate(item.route)}
                        />
                    ))}
                </View>
            </DrawerContentScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ef4444" />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: moderateScale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    avatarContainer: {
        width: moderateScale(58),
        height: moderateScale(58),
        borderRadius: moderateScale(29),
        backgroundColor: '#115e59',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0f766e',
    },
    avatarInitial: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        marginLeft: scale(15),
    },
    userName: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userRole: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginTop: verticalScale(3),
        fontWeight: '500',
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
        color: '#115e59',
        fontWeight: '700',
    },
    footer: {
        padding: moderateScale(20),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
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
});

export default CustomDrawerContent;
