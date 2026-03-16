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
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

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
        } else {
            setLoading(false);
        }
    }, [fetchProviderData, user?.role]);

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
            <StatusBar barStyle="dark-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#10b981" />
                }
            >
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                            onPress={() => navigation.openDrawer()}
                            style={{ marginRight: moderateScale(15) }}
                        >
                            <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.welcomeText}>Pro Dashboard</Text>
                            <Text style={styles.nameText}>Hi, {user?.name || 'Partner'}</Text>
                        </View>
                    </View>
                    <View style={styles.statusToggle}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>

                {/* Onboarding Prompt */}
                {(!user?.profile_completed) && (
                    <TouchableOpacity
                        style={styles.onboardingBanner}
                        onPress={() => navigation.navigate('ProfileSetup')}
                    >
                        <View style={styles.onboardingLeft}>
                            <Text style={styles.onboardingIcon}>🚀</Text>
                            <View>
                                <Text style={styles.onboardingTitle}>Complete Your Profile</Text>
                                <Text style={styles.onboardingSubtitle}>Add skills, documents & bank details to start earning</Text>
                            </View>
                        </View>
                        <Text style={styles.onboardingArrow}>›</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.statsRow}>
                    <StatBox label="Total Earnings" value={formatCurrency(dashboardData.stats.totalEarnings)} color="#10b981" />
                    <StatBox label="Avg Rating" value={dashboardData.stats.averageRating?.toFixed(1) || '0.0'} color="#f59e0b" />
                </View>

                <View style={styles.jobsCard}>
                    <Text style={styles.jobsTitle}>New Jobs Available</Text>
                    <Text style={styles.jobsSubtitle}>
                        You have {dashboardData.availableJobsCount} jobs matching your skills nearby
                    </Text>
                    <TouchableOpacity style={styles.viewJobsButton} onPress={() => navigation.navigate('Services')}>
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
                                <TouchableOpacity style={styles.detailsIcon}>
                                    <Text style={{ fontSize: moderateScale(20) }}>➡️</Text>
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
    statusToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
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
        fontSize: moderateScale(12),
    },
    onboardingBanner: {
        backgroundColor: '#fffbeb',
        borderRadius: moderateScale(20),
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#fde68a',
        elevation: 2,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    onboardingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    onboardingIcon: {
        fontSize: moderateScale(28),
        marginRight: moderateScale(12),
    },
    onboardingTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: verticalScale(2),
    },
    onboardingSubtitle: {
        fontSize: moderateScale(11),
        color: '#b45309',
        flexShrink: 1,
        lineHeight: moderateScale(15),
    },
    onboardingArrow: {
        fontSize: moderateScale(22),
        color: '#f59e0b',
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    statBox: {
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(18),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    statValue: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: moderateScale(11),
        marginTop: verticalScale(4),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    jobsCard: {
        backgroundColor: '#115e59',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        marginBottom: verticalScale(25),
        elevation: 8,
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    jobsTitle: {
        color: '#fff',
        fontSize: moderateScale(20),
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    dateBox: {
        backgroundColor: '#f8fafc',
        padding: moderateScale(8),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        width: moderateScale(55),
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
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobDetails: {
        flex: 1,
        marginLeft: moderateScale(14),
    },
    jobType: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobTime: {
        fontSize: moderateScale(11),
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
