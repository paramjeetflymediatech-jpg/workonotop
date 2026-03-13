import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { verticalScale } from '../utils/responsive';
import { API_BASE_URL } from '../config';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    const firstName = user?.first_name || user?.name || 'User';

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogoutPress = () => setLogoutModalVisible(true);
    const handleLogoutCancel = () => setLogoutModalVisible(false);
    const handleLogoutConfirm = () => {
        setLogoutModalVisible(false);
        logout();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {user?.image_url ? (
                        <Image 
                            source={{ uri: user.image_url.startsWith('http') ? user.image_url : `${API_BASE_URL}${user.image_url}` }} 
                            style={styles.avatarImage} 
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {firstName.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>
                <Text style={styles.name}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : firstName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#ef4444' : user?.role === 'provider' ? '#3b82f6' : '#10b981' }]}>
                    <Text style={styles.roleBadgeText}>{(user?.role || 'user').toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyBookings')}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="calendar-outline" size={20} color="#115e59" />
                    </View>
                    <Text style={styles.menuText}>My Bookings</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UpdateProfile')}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="person-outline" size={20} color="#115e59" />
                    </View>
                    <Text style={styles.menuText}>Update Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="settings-outline" size={20} color="#115e59" />
                    </View>
                    <Text style={styles.menuText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HelpSupport')}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="help-buoy-outline" size={20} color="#115e59" />
                    </View>
                    <Text style={styles.menuText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <LogoutConfirmationModal 
                visible={logoutModalVisible}
                onCancel={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />

            {/* Bottom Space for Floating Tab Bar */}
            <View style={{ height: verticalScale(120) + insets.bottom }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: verticalScale(50),
        marginBottom: verticalScale(40),
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    email: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    roleBadge: {
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    menuContainer: {
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: '#ef4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
