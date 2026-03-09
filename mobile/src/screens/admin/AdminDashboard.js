import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

const AdminDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeJobs: 0,
        totalProviders: 0,
        totalCustomers: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/api/stats'),
                api.get('/api/bookings?limit=5')
            ]);

            if (statsRes.success) {
                const s = statsRes.data;
                setStats({
                    totalRevenue: parseFloat(s.totalRevenue || 0),
                    activeJobs: (s.pendingJobs || 0) + (s.confirmedJobs || 0) + (s.inProgressJobs || 0),
                    totalProviders: s.totalTradespeople || 0,
                    totalCustomers: s.totalCustomers || 0
                });
            }

            if (bookingsRes.success) {
                setRecentBookings(bookingsRes.data || []);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea' };
            case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

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

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loaderText}>Loading Admin Data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#14b8a6" />
                }
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
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
                    <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="💰" color="#10b981" />
                    <StatCard title="Active Jobs" value={stats.activeJobs.toString()} icon="🛠️" color="#3b82f6" />
                    <StatCard title="Providers" value={stats.totalProviders.toString()} icon="👷" color="#f59e0b" />
                    <StatCard title="Customers" value={stats.totalCustomers.toString()} icon="👥" color="#8b5cf6" />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <ActionButton title="Manage Pros" icon="👷" color="#f59e0b" onPress={() => navigation.navigate('Providers')} />
                    <ActionButton title="View Reports" icon="📊" color="#3b82f6" onPress={() => navigation.navigate('Analytics')} />
                    <ActionButton title="System Settings" icon="⚙️" color="#64748b" onPress={() => navigation.navigate('Settings')} />
                    <ActionButton title="Support" icon="🎧" color="#ef4444" onPress={() => { }} />
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Bookings</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Job Requests')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => {
                            const status = getStatusStyle(booking.status);
                            const amount = parseFloat(booking.service_price || 0) + parseFloat(booking.additional_price || 0);
                            return (
                                <View key={booking.id} style={styles.bookingItem}>
                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.bookingTitle}>{booking.service_name}</Text>
                                        <Text style={styles.bookingSubtitle}>
                                            {booking.customer_first_name} {booking.customer_last_name} • {formatCurrency(amount)}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                        <Text style={[styles.statusText, { color: status.text }]}>
                                            {booking.status?.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No recent bookings found.</Text>
                    )}
                </View>

                {/* Bottom Space for Floating Tab Bar */}
                <View style={{ height: verticalScale(100) + insets.bottom }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loaderText: {
        marginTop: verticalScale(12),
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(25),
        marginTop: verticalScale(25),
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
    menuButton: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: scale(15),
    },
    avatar: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: '#115e59',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
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
        marginBottom: verticalScale(20),
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
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statTitle: {
        fontSize: moderateScale(11),
        color: '#64748b',
        fontWeight: '600',
        marginBottom: verticalScale(4),
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statIcon: {
        fontSize: moderateScale(22),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(15),
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    actionButton: {
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    actionIcon: {
        fontSize: moderateScale(28),
        marginBottom: verticalScale(8),
    },
    actionTitle: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
    },
    recentSection: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(18),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    viewAllText: {
        color: '#115e59',
        fontWeight: '700',
        fontSize: moderateScale(13),
    },
    bookingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    bookingTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    bookingSubtitle: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    statusBadge: {
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
        minWidth: moderateScale(75),
        alignItems: 'center',
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginVertical: verticalScale(10),
        fontSize: moderateScale(13),
    }
});

export default AdminDashboard;
