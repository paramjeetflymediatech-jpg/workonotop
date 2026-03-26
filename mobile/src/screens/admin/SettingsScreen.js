import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Switch,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const SettingsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Settings</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SectionHeader title="Account & Security" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Change your admin details"
                        onPress={() => navigation.navigate('Profile')}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Change Password"
                        subtitle="Last changed 3 months ago"
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Two-Factor Auth"
                        subtitle="Enhanced account security"
                        type="switch"
                        value={true}
                    />
                </View>

                <SectionHeader title="Notifications" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Notification Preferences"
                        subtitle="Manage Push and Email Reports"
                        onPress={() => navigation.navigate('NotificationSettings')}
                    />
                </View>

                <SectionHeader title="Platform Controls" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="checkmark-circle-outline"
                        title="Auto-Approve Providers"
                        subtitle="Instantly activate new applicants"
                        type="switch"
                        value={autoApprove}
                        onValueChange={setAutoApprove}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="hammer-outline"
                        title="Maintenance Mode"
                        subtitle="Disable frontend for all users"
                        type="switch"
                        value={maintenanceMode}
                        onValueChange={setMaintenanceMode}
                        color="#ef4444"
                    />
                </View>

                <SectionHeader title="Support & About" />
                <View style={styles.sectionCard}>
                    <SettingItem icon="help-circle-outline" title="Help Center" color="#64748b" />
                    <View style={styles.divider} />
                    <SettingItem icon="document-text-outline" title="Terms & Privacy" color="#64748b" />
                    <View style={styles.divider} />
                    <SettingItem icon="information-circle-outline" title="Platform Version" subtitle="v2.4.0 (Build 112)" color="#64748b" />
                </View>

                <View style={{ height: verticalScale(40) }} />
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
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: scale(20) },
    sectionHeader: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: verticalScale(12), marginLeft: scale(5) },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        marginBottom: verticalScale(25),
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
    divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: scale(16) }
});

export default SettingsScreen;
