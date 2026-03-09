import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { verticalScale } from '../utils/responsive';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(user?.first_name || user?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.name || 'User')}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#ef4444' : user?.role === 'provider' ? '#3b82f6' : '#10b981' }]}>
                    <Text style={styles.roleBadgeText}>{(user?.role || 'user').toUpperCase()}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

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
        marginTop: 40,
        marginBottom: 40,
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
