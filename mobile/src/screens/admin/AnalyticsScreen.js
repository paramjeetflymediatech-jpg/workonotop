import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/stats');
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const MetricCard = ({ title, value, icon, color, trend }) => (
        <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={moderateScale(24)} color={color} />
            </View>
            <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>{title}</Text>
                <Text style={styles.metricValue}>{value}</Text>
                {trend && (
                    <View style={styles.trendRow}>
                        <Ionicons name="trending-up" size={moderateScale(12)} color="#10b981" />
                        <Text style={styles.trendText}>{trend} vs last month</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const ProgressBar = ({ label, value, total, color }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <View style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>{label}</Text>
                    <Text style={styles.progressValue}>{value} ({Math.round(percentage)}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#115e59" />
                <Text style={styles.loaderText}>Generating Reports...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                }
            >
                <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
                <View style={styles.metricsGrid}>
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        icon="cash-outline"
                        color="#10b981"
                        trend="12%"
                    />
                    <MetricCard
                        title="Avg. Job Value"
                        value={formatCurrency(stats?.avgBookingPrice || 0)}
                        icon="calculator-outline"
                        color="#3b82f6"
                    />
                    <MetricCard
                        title="Bookings"
                        value={stats?.totalBookings || 0}
                        icon="calendar-outline"
                        color="#f59e0b"
                        trend="8%"
                    />
                    <MetricCard
                        title="User Growth"
                        value={stats?.totalCustomers || 0}
                        icon="trending-up-outline"
                        color="#8b5cf6"
                        trend="15%"
                    />
                </View>

                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Job Distribution</Text>
                    <View style={styles.progressCard}>
                        <ProgressBar label="Pending" value={stats?.pendingJobs || 0} total={stats?.totalBookings || 0} color="#f59e0b" />
                        <ProgressBar label="Confirmed" value={stats?.confirmedJobs || 0} total={stats?.totalBookings || 0} color="#3b82f6" />
                        <ProgressBar label="In Progress" value={stats?.inProgressJobs || 0} total={stats?.totalBookings || 0} color="#8b5cf6" />
                        <ProgressBar label="Completed" value={stats?.completedJobs || 0} total={stats?.totalBookings || 0} color="#10b981" />
                        <ProgressBar label="Cancelled" value={stats?.cancelledJobs || 0} total={stats?.totalBookings || 0} color="#ef4444" />
                    </View>
                </View>

                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Platform Summary</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Tradespeople</Text>
                            <Text style={styles.summaryVal}>{stats?.totalTradespeople || 0}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Active Services</Text>
                            <Text style={styles.summaryVal}>{stats?.totalServices || 0}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Avg. Provider Rating</Text>
                            <Text style={styles.summaryVal}>4.8 ⭐</Text>
                        </View>
                    </View>
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
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: verticalScale(15), color: '#64748b', fontWeight: '600' },
    scrollContent: { padding: scale(20) },
    sectionTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(15) },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    metricCard: {
        width: (width - scale(55)) / 2,
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(15),
        marginBottom: verticalScale(15),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconContainer: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    metricLabel: { fontSize: moderateScale(12), color: '#64748b', fontWeight: '600' },
    metricValue: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a', marginVertical: verticalScale(4) },
    trendRow: { flexDirection: 'row', alignItems: 'center' },
    trendText: { fontSize: moderateScale(10), color: '#10b981', fontWeight: 'bold', marginLeft: scale(4) },
    chartSection: { marginVertical: verticalScale(10) },
    progressCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: scale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    progressItem: { marginBottom: verticalScale(15) },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(6) },
    progressLabel: { fontSize: moderateScale(13), color: '#475569', fontWeight: '600' },
    progressValue: { fontSize: moderateScale(12), color: '#64748b', fontWeight: 'bold' },
    progressBarBg: { height: verticalScale(8), backgroundColor: '#f1f5f9', borderRadius: moderateScale(4), overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: moderateScale(4) },
    summarySection: { marginTop: verticalScale(10) },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        paddingVertical: verticalScale(5),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: scale(20) },
    summaryLabel: { fontSize: moderateScale(14), color: '#475569', fontWeight: '600' },
    summaryVal: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    summaryDivider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: scale(20) },
});

export default AnalyticsScreen;
