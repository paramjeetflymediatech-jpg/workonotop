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
    RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const ProviderDashboard = ({ navigation }) => {
    const { user } = useAuth();
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

    const fetchProviderData = async () => {
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
    };

    useEffect(() => {
        fetchProviderData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviderData();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const StatBox = ({ label, value, color }) => (
        <View style={[styles.statBox, { backgroundColor: color + '15' }]}>
            <Text style={[styles.statValue, { color: color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: color }]}>{label}</Text>
        </View>
    );

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
                    <View>
                        <Text style={styles.welcomeText}>Pro Dashboard</Text>
                        <Text style={styles.nameText}>Hi, {user?.name || 'Partner'}</Text>
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

                <View style={styles.toolsGrid}>
                    <TouchableOpacity style={styles.toolCard}>
                        <Text style={styles.toolIcon}>📊</Text>
                        <Text style={styles.toolTitle}>Earning History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolCard}>
                        <Text style={styles.toolIcon}>⭐</Text>
                        <Text style={styles.toolTitle}>My Reviews</Text>
                    </TouchableOpacity>
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
        marginBottom: verticalScale(30),
    },
    welcomeText: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    nameText: {
        fontSize: moderateScale(28),
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
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#fde68a',
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
        fontSize: moderateScale(12),
        color: '#b45309',
        flexShrink: 1,
    },
    onboardingArrow: {
        fontSize: moderateScale(24),
        color: '#f59e0b',
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    statBox: {
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
    },
    statValue: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: moderateScale(12),
        marginTop: verticalScale(4),
        fontWeight: '500',
    },
    jobsCard: {
        backgroundColor: '#1e293b',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        marginBottom: verticalScale(30),
    },
    jobsTitle: {
        color: '#fff',
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    jobsSubtitle: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
        marginTop: verticalScale(6),
        marginBottom: verticalScale(20),
    },
    viewJobsButton: {
        backgroundColor: '#14b8a6',
        padding: moderateScale(14),
        borderRadius: moderateScale(12),
        alignItems: 'center',
    },
    viewJobsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(16),
    },
    scheduleItem: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dateBox: {
        backgroundColor: '#f1f5f9',
        padding: moderateScale(10),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        width: moderateScale(60),
    },
    dateDay: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: 'bold',
    },
    dateNum: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobDetails: {
        flex: 1,
        marginLeft: moderateScale(16),
    },
    jobType: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobTime: {
        fontSize: moderateScale(12),
        color: '#14b8a6',
        marginTop: verticalScale(2),
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    jobLocation: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginTop: verticalScale(4),
    },
    toolsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(10),
    },
    toolCard: {
        backgroundColor: '#fff',
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toolIcon: {
        fontSize: moderateScale(28),
        marginBottom: verticalScale(10),
    },
    toolTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#475569',
    },
    emptyContainer: {
        backgroundColor: '#fff',
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
    }
});

export default ProviderDashboard;
