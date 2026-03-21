import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Switch,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
    const { token } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        push_notifications_enabled: true,
        receive_offers: true,
        booking_reminders_enabled: true,
        dark_mode_enabled: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await apiService.user.getSettings(token);
            if (res.success && res.data) {
                setSettings(res.data);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key, value) => {
        const previousValue = settings[key];

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        try {
            const res = await apiService.user.updateSettings({ [key]: value }, token);
            if (!res.success) {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error('Update setting error:', error);
            Alert.alert('Error', 'Failed to update setting. Reverting...');
            // Revert on failure
            setSettings(prev => ({ ...prev, [key]: previousValue }));
        }
    };

    const SettingItem = ({ icon, title, subtitle, type, value, onValueChange, onPress, color = "#115e59" }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={moderateScale(20)} color={color} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#e2e8f0', true: color + '70' }}
                    thumbColor={value ? color : '#f8fafc'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#cbd5e1" />
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: moderateScale(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SectionHeader title="Account" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                        onPress={() => navigation.navigate('UpdateProfile')}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Change Password"
                        onPress={() => navigation.navigate('ChangePassword')}
                    />
                </View>

                <SectionHeader title="Notifications" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Receive alerts on your device"
                        type="switch"
                        value={settings.push_notifications_enabled}
                        onValueChange={(val) => toggleSetting('push_notifications_enabled', val)}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="mail-outline"
                        title="Email Updates"
                        subtitle="Receive news and offers"
                        type="switch"
                        value={settings.receive_offers}
                        onValueChange={(val) => toggleSetting('receive_offers', val)}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="calendar-outline"
                        title="Booking Reminders"
                        subtitle="Alerts for upcoming services"
                        type="switch"
                        value={settings.booking_reminders_enabled}
                        onValueChange={(val) => toggleSetting('booking_reminders_enabled', val)}
                    />
                </View>

                <SectionHeader title="Preferences" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="moon-outline"
                        title="Dark Mode"
                        type="switch"
                        value={settings.dark_mode_enabled}
                        onValueChange={(val) => toggleSetting('dark_mode_enabled', val)}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="globe-outline"
                        title="Language"
                        subtitle="English (US)"
                        onPress={() => Alert.alert('Language', 'Language selection will be available in the next update.')}
                    />
                </View>

                <SectionHeader title="About" />
                <View style={styles.sectionCard}>
                    <SettingItem 
                        icon="document-text-outline" 
                        title="Terms of Service" 
                        color="#64748b" 
                        onPress={() => navigation.navigate('Legal', { type: 'terms' })}
                    />
                    <View style={styles.divider} />
                    <SettingItem 
                        icon="shield-checkmark-outline" 
                        title="Privacy Policy" 
                        color="#64748b" 
                        onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                    />
                    <View style={styles.divider} />
                    <SettingItem 
                        icon="information-circle-outline" 
                        title="About Us" 
                        color="#64748b" 
                        onPress={() => navigation.navigate('Legal', { type: 'about' })}
                    />
                    <View style={styles.divider} />
                    <View style={styles.versionInfo}>
                        <Text style={styles.versionLabel}>App Version</Text>
                        <Text style={styles.versionValue}>v{Constants.expoConfig?.version || '1.0.0'}</Text>
                    </View>
                </View>

                <View style={{ height: verticalScale(20) }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: scale(20) },
    sectionHeader: { fontSize: moderateScale(12), fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: verticalScale(10), marginLeft: scale(5) },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: scale(16) },
    iconBox: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(10), justifyContent: 'center', alignItems: 'center', marginRight: scale(15) },
    settingInfo: { flex: 1 },
    settingTitle: { fontSize: moderateScale(15), fontWeight: '600', color: '#0f172a' },
    settingSubtitle: { fontSize: moderateScale(12), color: '#64748b', marginTop: verticalScale(2) },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: scale(16) },
    versionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        backgroundColor: '#f8fafc',
    },
    versionLabel: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    versionValue: {
        fontSize: moderateScale(14),
        color: '#0f172a',
        fontWeight: 'bold',
    }
});

export default SettingsScreen;
