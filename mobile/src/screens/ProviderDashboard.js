import React, { useState, useEffect, useCallback, memo } from 'react';
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
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const TEAL_DARK = '#134e4a';
const TEAL_LIGHT = '#14b8a6';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const StatBox = memo(({ label, value, color }) => (
    <View style={[styles.statBox, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statValue, { color: color }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: color }]}>{label}</Text>
    </View>
));

const ProviderDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalJobs: 0,
            completedJobs: 0,
            totalEarnings: 0,
            averageRating: 0
        },
        recentJobs: [],
        availableJobsCount: 0
    });
    const [isAvailable, setIsAvailable] = useState(true);
    const [toggling, setToggling] = useState(false);

    const fetchAvailability = useCallback(async () => {
        try {
            const res = await api.get('/api/provider/availability');
            if (res?.success) setIsAvailable(res.is_available);
        } catch (_) {}
    }, []);

    const toggleAvailability = async () => {
        if (toggling) return;
        setToggling(true);
        const next = !isAvailable;
        setIsAvailable(next); // optimistic
        try {
            const res = await api.post('/api/provider/availability', { is_available: next });
            if (!res?.success) setIsAvailable(!next); // revert on fail
        } catch (_) {
            setIsAvailable(!next);
        } finally {
            setToggling(false);
        }
    };

    const fetchProviderData = useCallback(async () => {
        try {
            const [statsRes, availableRes] = await Promise.all([
                api.get('/api/provider/dashboard-stats'),
                api.get('/api/provider/available-jobs')
            ]);

            setDashboardData({
                stats: statsRes.stats || {},
                recentJobs: statsRes.stats?.recentJobs || [],
                availableJobsCount: availableRes.data?.length || 0
            });
        } catch (error) {
            console.error('Error fetching provider data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'provider') {
            fetchProviderData();
            fetchAvailability();
        } else {
            setLoading(false);
        }
    }, [fetchProviderData, fetchAvailability, user?.role]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviderData();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loaderText}>Loading Pro Dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(15)) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                        onPress={() => navigation.openDrawer()}
                        style={styles.menuBtn}
                    >
                        <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.welcomeText}>Pro Dashboard</Text>
                        <Text style={styles.nameText}>Hi, {user?.name || 'Partner'}</Text>
                    </View>
                </View>
                <View style={[styles.statusToggle, { 
                    backgroundColor: isAvailable ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                    borderColor: isAvailable ? 'rgba(255,255,255,0.2)' : 'transparent' 
                }]}>
                    <Switch
                        value={isAvailable}
                        onValueChange={toggleAvailability}
                        trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#10b981' }}
                        thumbColor={isAvailable ? '#fff' : '#f1f5f9'}
                        ios_backgroundColor="rgba(255,255,255,0.2)"
                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    />
                    <Text style={[styles.statusText, { color: '#fff' }]}>
                        {isAvailable ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#10b981" />
                }
            >



                <View style={styles.statsRow}>
                    <StatBox label="Total Earnings" value={formatCurrency(dashboardData.stats.totalEarnings)} color="#10b981" />
                    <StatBox label="Avg Rating" value={dashboardData.stats.averageRating?.toFixed(1) || '0.0'} color="#f59e0b" />
                </View>

                <View style={styles.jobsCard}>
                    <Text style={styles.jobsTitle}>New Jobs Available</Text>
                    <Text style={styles.jobsSubtitle}>
                        You have {dashboardData.availableJobsCount} jobs matching your skills nearby
                    </Text>
                    <TouchableOpacity style={styles.viewJobsButton} onPress={() => navigation.navigate('ContractorJobs')}>
                        <Text style={styles.viewJobsText}>View Available Jobs</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Upcoming Schedule</Text>

                {dashboardData.recentJobs.length > 0 ? (
                    dashboardData.recentJobs.map((job) => {
                        const jobDate = new Date(job.job_date);
                        const day = jobDate.getDate();
                        const month = jobDate.toLocaleString('default', { month: 'short' }).toUpperCase();

                        return (
                            <View key={job.id} style={styles.scheduleItem}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateDay}>{month}</Text>
                                    <Text style={styles.dateNum}>{day < 10 ? `0${day}` : day}</Text>
                                </View>
                                <View style={styles.jobDetails}>
                                    <Text style={styles.jobType}>{job.service_name}</Text>
                                    <Text style={styles.jobTime}>{job.status?.replace('_', ' ')}</Text>
                                    <Text style={styles.jobLocation}>Earning: {formatCurrency(job.provider_amount)}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.detailsIcon}
                                    onPress={() => navigation.navigate('JobDetails', { job })}
                                >
                                    <View style={{ width: moderateScale(30), height: moderateScale(30), borderRadius: 15, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="chevron-forward" size={moderateScale(18)} color="#64748b" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No upcoming jobs scheduled.</Text>
                    </View>
                )}


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
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(16),
    },
    menuBtn: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
        marginRight: scale(12),
    },
    welcomeText: {
        fontSize: moderateScale(12),
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    nameText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#fff',
    },
    statusToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: '#bcf0da',
    },
    statusDot: {
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: '#10b981',
        marginRight: moderateScale(6),
    },
    statusText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: moderateScale(11),
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
        gap: scale(10),
    },
    statBox: {
        flex: 1,
        padding: moderateScale(15),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    statValue: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: moderateScale(10),
        marginTop: verticalScale(4),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    jobsCard: {
        backgroundColor: '#115e59',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        marginBottom: verticalScale(25),
        elevation: 8,
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: verticalScale(5) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(15),
    },
    jobsTitle: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    jobsSubtitle: {
        color: '#ccfbf1',
        fontSize: moderateScale(13),
        marginTop: verticalScale(4),
        marginBottom: verticalScale(15),
        lineHeight: moderateScale(18),
    },
    viewJobsButton: {
        backgroundColor: '#fff',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        alignItems: 'center',
    },
    viewJobsText: {
        color: '#115e59',
        fontWeight: 'bold',
        fontSize: moderateScale(15),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(12),
    },
    scheduleItem: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.05,
        shadowRadius: moderateScale(10),
    },
    dateBox: {
        backgroundColor: '#f8fafc',
        padding: moderateScale(8),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        width: moderateScale(52),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dateDay: {
        fontSize: moderateScale(9),
        color: '#64748b',
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    dateNum: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobDetails: {
        flex: 1,
        marginLeft: moderateScale(12),
    },
    jobType: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobTime: {
        fontSize: moderateScale(10),
        color: '#115e59',
        marginTop: verticalScale(2),
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    jobLocation: {
        fontSize: moderateScale(11),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    detailsIcon: {
        padding: moderateScale(5),
    },
    emptyContainer: {
        backgroundColor: '#fff',
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
    }
});

export default ProviderDashboard;
