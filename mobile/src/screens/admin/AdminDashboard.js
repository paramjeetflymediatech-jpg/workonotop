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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';
const TEAL_LIGHT = '#14b8a6';

const AdminDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeJobs: 0,
        totalProviders: 0,
        totalCustomers: 0,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, bookingsRes, notificationsRes] = await Promise.all([
                api.get('/api/stats'),
                api.get('/api/bookings?limit=5'),
                api.get('/api/admin/notifications'),
            ]);

            if (statsRes.success) {
                const s = statsRes.data;
                setStats({
                    totalRevenue: parseFloat(s.totalRevenue || 0),
                    activeJobs: (s.pendingJobs || 0) + (s.confirmedJobs || 0) + (s.inProgressJobs || 0),
                    totalProviders: s.totalTradespeople || 0,
                    totalCustomers: s.totalCustomers || 0,
                });
            }

            if (bookingsRes.success) {
                setRecentBookings(bookingsRes.data || []);
            }

            if (notificationsRes.success) {
                const unread = (notificationsRes.data || []).filter(n => !n.is_read).length;
                setUnreadNotifications(unread);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#b45309', label: 'Pending' };
            case 'confirmed': return { bg: '#dbeafe', text: '#1d4ed8', label: 'Confirmed' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#7c3aed', label: 'In Progress' };
            case 'completed': return { bg: '#dcfce7', text: '#15803d', label: 'Completed' };
            case 'cancelled': return { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' };
            default: return { bg: '#f1f5f9', text: '#64748b', label: status };
        }
    };

    const statCards = [
        { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: 'cash-outline', color: '#10b981', bg: '#d1fae5', screen: 'Earnings' },
        { title: 'Active Jobs', value: stats.activeJobs.toString(), icon: 'briefcase-outline', color: '#3b82f6', bg: '#dbeafe', screen: 'Job Requests' },
        { title: 'Providers', value: stats.totalProviders.toString(), icon: 'construct-outline', color: '#f59e0b', bg: '#fef3c7', screen: 'Providers' },
        { title: 'Customers', value: stats.totalCustomers.toString(), icon: 'people-outline', color: '#8b5cf6', bg: '#ede9fe', screen: 'Users' },
    ];

    const quickActions = [
        { title: 'Providers', icon: 'construct-outline', color: '#f59e0b', bg: '#fffbeb', screen: 'Providers' },
        { title: 'Analytics', icon: 'bar-chart-outline', color: '#3b82f6', bg: '#eff6ff', screen: 'Analytics' },
        { title: 'Services', icon: 'layers-outline', color: '#10b981', bg: '#ecfdf5', screen: 'ServicesList' },
        { title: 'Settings', icon: 'settings-outline', color: '#64748b', bg: '#f8fafc', screen: 'Settings' },
    ];

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={TEAL} />
                <Text style={styles.loaderText}>Loading dashboard...</Text>
            </View>
        );
    }

    const adminName = user?.name || user?.email?.split('@')[0] || 'Admin';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={[TEAL]} />}
                contentContainerStyle={{ paddingBottom: verticalScale(100) + insets.bottom }}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        {/* <Text style={styles.headerLabel}>Admin Panel</Text> */}
                        <Text style={styles.headerName}>Welcome back, {adminName}</Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.notificationBtn} 
                        onPress={() => navigation.navigate('AdminNotifications')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={moderateScale(24)} color="#fff" />
                        {unreadNotifications > 0 && <View style={styles.notificationBadge} />}
                    </TouchableOpacity>
                </View>

                {/* ── Summary banner ── */}
                {/* <View style={styles.banner}>
                    <View style={styles.bannerLeft}>
                        <Text style={styles.bannerTitle}>Today's Overview</Text>
                        <Text style={styles.bannerSub}>Monitor platform health at a glance</Text>
                    </View>
                    <View style={styles.bannerIcon}>
                        <Ionicons name="pulse-outline" size={moderateScale(30)} color={TEAL_LIGHT} />
                    </View>
                </View> */}

                {/* ── Stat Cards ── */}
                <View style={styles.cardGrid}>
                    {statCards.map((card) => (
                        <TouchableOpacity 
                            key={card.title} 
                            style={styles.statCard}
                            onPress={() => navigation.navigate(card.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.statIconCircle, { backgroundColor: card.bg }]}>
                                <Ionicons name={card.icon} size={moderateScale(22)} color={card.color} />
                            </View>
                            <Text style={styles.statValue}>{card.value}</Text>
                            <Text style={styles.statTitle}>{card.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Quick Actions ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.title}
                                style={[styles.actionTile, { backgroundColor: action.bg }]}
                                onPress={() => navigation.navigate(action.screen)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.actionIconCircle, { backgroundColor: action.color + '20' }]}>
                                    <Ionicons name={action.icon} size={moderateScale(24)} color={action.color} />
                                </View>
                                <Text style={[styles.actionLabel, { color: action.color }]}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Recent Bookings ── */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Recent Bookings</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Job Requests')}>
                            <Text style={styles.viewAll}>View all →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bookingsCard}>
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, index) => {
                                const st = getStatusConfig(booking.status);
                                const amount = parseFloat(booking.service_price || 0) + parseFloat(booking.additional_price || 0);
                                return (
                                    <TouchableOpacity
                                        key={booking.id}
                                        style={[
                                            styles.bookingRow,
                                            index < recentBookings.length - 1 && styles.bookingRowBorder,
                                        ]}
                                        onPress={() => navigation.navigate('AdminJobDetails', { booking })}
                                    >
                                        <View style={styles.bookingIconWrap}>
                                            <Ionicons name="hammer-outline" size={moderateScale(18)} color={TEAL} />
                                        </View>
                                        <View style={styles.bookingInfo}>
                                            <Text style={styles.bookingService} numberOfLines={1}>{booking.service_name}</Text>
                                            <Text style={styles.bookingMeta}>
                                                {booking.customer_first_name} {booking.customer_last_name} · {formatCurrency(amount)}
                                            </Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: st.bg }]}>
                                            <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.emptyWrap}>
                                <Ionicons name="receipt-outline" size={moderateScale(40)} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No recent bookings</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const CARD_W = (SCREEN_WIDTH - moderateScale(52)) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    loaderText: {
        marginTop: verticalScale(12),
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(30),
        paddingBottom: verticalScale(20),
    },
    menuBtn: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginLeft: scale(14),
    },
    headerLabel: {
        fontSize: moderateScale(11),
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerName: {
        fontSize: moderateScale(17),
        fontWeight: 'bold',
        color: '#fff',
        marginTop: verticalScale(2),
    },
    notificationBtn: {
        width: moderateScale(42),
        height: moderateScale(42),
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: moderateScale(10),
        right: moderateScale(10),
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: TEAL_DARK,
    },

    /* Banner */
    // banner: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     backgroundColor: TEAL,
    //     marginHorizontal: scale(16),
    //     marginTop: verticalScale(2),
    //     borderBottomLeftRadius: moderateScale(20),
    //     borderBottomRightRadius: moderateScale(20),
    //     paddingHorizontal: scale(20),
    //     paddingVertical: verticalScale(16),
    //     marginBottom: verticalScale(20),
    //     elevation: 4,
    //     shadowColor: TEAL,
    //     shadowOffset: { width: 0, height: 4 },
    //     shadowOpacity: 0.25,
    //     shadowRadius: 10,
    // },
    // bannerTitle: {
    //     fontSize: moderateScale(15),
    //     fontWeight: 'bold',
    //     color: '#fff',
    // },
    // bannerSub: {
    //     fontSize: moderateScale(11),
    //     color: 'rgba(255,255,255,0.7)',
    //     marginTop: verticalScale(2),
    // },
    // bannerLeft: { flex: 1 },
    // bannerIcon: {
    //     width: moderateScale(50),
    //     height: moderateScale(50),
    //     borderRadius: moderateScale(25),
    //     backgroundColor: 'rgba(255,255,255,0.15)',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },

    /* Stat Cards */
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(8),
        marginTop: verticalScale(6),
    },
    statCard: {
        width: CARD_W,
        backgroundColor: '#fff',
        borderRadius: moderateScale(18),
        padding: moderateScale(16),
        marginBottom: verticalScale(14),
        alignItems: 'flex-start',
        elevation: 3,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    statIconCircle: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    statValue: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(4),
    },
    statTitle: {
        fontSize: moderateScale(11),
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* Sections */
    section: {
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(20),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(14),
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    viewAll: {
        fontSize: moderateScale(13),
        color: TEAL,
        fontWeight: '700',
    },

    /* Quick Actions */
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionTile: {
        width: CARD_W,
        borderRadius: moderateScale(18),
        padding: moderateScale(16),
        marginBottom: verticalScale(12),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    actionIconCircle: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    actionLabel: {
        fontSize: moderateScale(13),
        fontWeight: '700',
    },

    /* Bookings */
    bookingsCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    bookingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
    },
    bookingRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    bookingIconWrap: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(12),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    bookingInfo: { flex: 1, marginRight: scale(8) },
    bookingService: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#0f172a',
    },
    bookingMeta: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        marginTop: verticalScale(2),
    },
    badge: {
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
    },
    badgeText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: verticalScale(30),
    },
    emptyText: {
        fontSize: moderateScale(14),
        color: '#94a3b8',
        marginTop: verticalScale(10),
        fontWeight: '500',
    },
});

export default AdminDashboard;
