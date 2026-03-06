import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const AdminDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();

    const StatCard = ({ title, value, icon, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statInfo}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>
            <Text style={styles.statIcon}>{icon}</Text>
        </View>
    );

    const ActionButton = ({ title, icon, onPress, color }) => (
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color + '10' }]}
            onPress={onPress}
        >
            <Text style={[styles.actionIcon, { color: color }]}>{icon}</Text>
            <Text style={[styles.actionTitle, { color: color }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Admin Panel</Text>
                        <Text style={styles.nameText}>Welcome, Admin</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard title="Total Earnings" value="$24,500" icon="💰" color="#10b981" />
                    <StatCard title="Active Jobs" value="128" icon="🛠️" color="#3b82f6" />
                    <StatCard title="Providers" value="45" icon="👷" color="#f59e0b" />
                    <StatCard title="Customers" value="850" icon="👥" color="#8b5cf6" />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <ActionButton title="Manage Pros" icon="👷" color="#f59e0b" onPress={() => { }} />
                    <ActionButton title="View Reports" icon="📊" color="#3b82f6" onPress={() => { }} />
                    <ActionButton title="System Settings" icon="⚙️" color="#64748b" onPress={() => { }} />
                    <ActionButton title="Support" icon="🎧" color="#ef4444" onPress={() => { }} />
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Bookings</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.bookingItem}>
                            <View style={styles.bookingInfo}>
                                <Text style={styles.bookingTitle}>Plumbing Repair</Text>
                                <Text style={styles.bookingSubtitle}>Customer: John Doe • $85</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Pending</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    welcomeText: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    nameText: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatar: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    statCard: {
        backgroundColor: '#fff',
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statTitle: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: '500',
        marginBottom: verticalScale(4),
    },
    statValue: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statIcon: {
        fontSize: moderateScale(24),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(16),
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    actionButton: {
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        fontSize: moderateScale(32),
        marginBottom: verticalScale(8),
    },
    actionTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    recentSection: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: moderateScale(20),
        marginBottom: verticalScale(20),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    viewAllText: {
        color: '#14b8a6',
        fontWeight: '600',
        fontSize: moderateScale(14),
    },
    bookingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    bookingTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#0f172a',
    },
    bookingSubtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    statusBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
    },
    statusText: {
        fontSize: moderateScale(12),
        color: '#d97706',
        fontWeight: '600',
    }
});

export default AdminDashboard;
