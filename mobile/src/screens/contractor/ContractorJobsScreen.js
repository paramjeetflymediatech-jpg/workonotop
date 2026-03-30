import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, ActivityIndicator, RefreshControl, Alert, StatusBar,
    Platform, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

const TEAL_DARK = '#134e4a';
const { width } = Dimensions.get('window');

const ContractorJobsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [stripeConnected, setStripeConnected] = useState(true);
    const [providerCity, setProviderCity] = useState('');

    const fetchJobs = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [jobsRes, provRes] = await Promise.all([
                api.get('/api/provider/available-jobs'),
                api.get('/api/provider/me')
            ]);

            if (provRes.success) {
                setStripeConnected(provRes.provider?.stripe_onboarding_complete || false);
            }

            if (jobsRes.success) {
                setJobs(jobsRes.data || []);
                if (jobsRes.provider_city) setProviderCity(jobsRes.provider_city);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        if (user?.role === 'provider') {
            fetchJobs();
        } else {
            setLoading(false);
        }
    }, [user?.role, fetchJobs, navigation]);

    const onRefresh = () => { setRefreshing(true); fetchJobs(true); };

    const acceptJob = async (jobId, hasOvertime, displayAmount) => {
        if (!stripeConnected) {
            Alert.alert('Stripe Not Connected', 'You need to connect your Stripe account before you can accept jobs.', [
                { text: 'Later', style: 'cancel' },
                { text: 'Connect Now', onPress: () => navigation.navigate('OnboardingIntro') }
            ]);
            return;
        }

        Alert.alert(
            'Accept this Job?', 
            `This job will be assigned to you immediately.\n\nYou earn: ${displayAmount}${hasOvertime ? '\n(Max 2hrs OT available)' : ''}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept Job', 
                    onPress: async () => {
                        try {
                            const res = await api.post('/api/provider/available-jobs', { booking_id: jobId });
                            if (res.success) {
                                Alert.alert('Success', '🎉 Job accepted! Check your schedule.');
                                fetchJobs(true);
                                navigation.navigate('MyJobs');
                            } else {
                                Alert.alert('Error', res.message || 'Failed to accept job.');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to accept job. It may have been taken.');
                        }
                    }
                },
            ]
        );
    };

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatDuration = (m) => {
        if (!m) return '60 min';
        if (m < 60) return `${m} min`;
        const h = Math.floor(m / 60), r = m % 60;
        return r ? `${h}h ${r}m` : `${h} hr${h > 1 ? 's' : ''}`;
    };

    const filteredJobs = jobs.filter(j => {
        if (filter === 'with_overtime') return j.pricing?.has_overtime;
        if (filter === 'base_only') return !j.pricing?.has_overtime;
        if (filter === 'assigned') return j.is_admin_assigned;
        return true;
    });

    const stats = {
        total: jobs.length,
        assigned: jobs.filter(j => j.is_admin_assigned).length,
        overtime: jobs.filter(j => j.pricing?.has_overtime).length,
        base: jobs.filter(j => !j.pricing?.has_overtime).length,
    };

    const renderJobItem = (job) => {
        const dur = job.pricing?.duration_minutes || 60;
        const commPct = job.pricing?.commission_percent || 0;
        const baseEarnings = job.pricing?.provider_base_earnings || 0;
        const otRate = job.pricing?.overtime_rate || 0;
        const hasOvertime = job.pricing?.has_overtime;
        const isAdminAssigned = job.is_admin_assigned;

        const cardBorderColor = isAdminAssigned ? '#bfdbfe' : (hasOvertime ? '#ddd6fe' : '#f1f5f9');
        const accentColor = isAdminAssigned ? '#2563eb' : (hasOvertime ? '#7c3aed' : '#14b8a6');

        return (
            <View key={job.id} style={[styles.jobCard, { borderColor: cardBorderColor }]}>
                {isAdminAssigned && (
                    <View style={styles.assignedBanner}>
                        <Ionicons name="sparkles" size={12} color="#1e40af" />
                        <Text style={styles.assignedBannerText}>Assigned to you by admin — waiting for acceptance</Text>
                    </View>
                )}
                {hasOvertime && !isAdminAssigned && (
                    <View style={styles.otHeaderBanner}>
                        <Ionicons name="time" size={14} color="#fff" />
                        <Text style={styles.otHeaderBannerText}>Overtime eligible — max 2 hrs @ ${otRate.toFixed(2)}/hr</Text>
                    </View>
                )}

                <View style={styles.cardHeader}>
                    <View style={styles.serviceIconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
                                <Text style={styles.categoryEmoji}>{job.category_icon || '🛠️'}</Text>
                        </View>
                        <View style={styles.serviceTextContainer}>
                            <Text style={styles.serviceName}>{job.service_name}</Text>
                            <Text style={styles.categoryName}>{job.category_name}</Text>
                        </View>
                    </View>
                    <View style={styles.earningsBadge}>
                        <Text style={styles.earnLabel}>You earn</Text>
                        <Text style={[styles.earnValue, { color: accentColor }]}>{job.display_amount}</Text>
                    </View>
                </View>

                <View style={styles.cardMeta}>
                    <View style={styles.badgeRow}>
                        <View style={styles.metaBadge}>
                            <Ionicons name="time-outline" size={12} color="#64748b" />
                            <Text style={styles.metaBadgeText}>{formatDuration(dur)}</Text>
                        </View>
                        {hasOvertime && (
                            <View style={[styles.metaBadge, styles.otBadge]}>
                                <Text style={styles.otBadgeText}>+${otRate.toFixed(2)}/hr OT</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                            <Text style={styles.infoItemText}>{formatDate(job.job_date)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={14} color="#94a3b8" />
                            <Text style={styles.infoItemText} numberOfLines={1}>{Array.isArray(job.job_time_slot) ? job.job_time_slot[0] : job.job_time_slot}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={14} color="#94a3b8" />
                            <Text style={styles.infoItemText} numberOfLines={1}>{job.address_line1?.split(',')[0]}</Text>
                        </View>
                    </View>

                    {(job.parking_access || job.elevator_access || job.has_pets) && (
                        <View style={styles.accessRow}>
                            {!!job.parking_access && <Text style={styles.accessTag}>Parking</Text>}
                            {!!job.elevator_access && <Text style={styles.accessTag}>Elevator</Text>}
                            {!!job.has_pets && <Text style={styles.accessTag}>Pets</Text>}
                        </View>
                    )}

                    <View style={styles.commissionInfo}>
                        <Text style={styles.commissionText}>
                            Base ${job.pricing?.base_price?.toFixed(2)} · {commPct}% fee · Net ${baseEarnings.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={styles.detailsBtn}
                        onPress={() => navigation.navigate('JobDetails', { job })}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.acceptBtnFull, { backgroundColor: accentColor }, !stripeConnected && styles.disabledBtn]}
                        onPress={() => acceptJob(job.id, hasOvertime, job.display_amount)}
                    >
                        <Text style={styles.acceptBtnTextFull}>
                            {!stripeConnected ? '🔒 Connect Stripe' : (isAdminAssigned ? 'Accept Task' : `Accept — ${job.display_amount}`)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loaderText}>Finding jobs near you...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(15)) }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Available Jobs</Text>
                    {providerCity ? (
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={10} color="#4ade80" />
                            <Text style={styles.locationText}>{providerCity}</Text>
                        </View>
                    ) : null}
                </View>
                <TouchableOpacity onPress={() => onRefresh()} disabled={refreshing} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stripe Banner */}
            {!stripeConnected && (
                <View style={styles.stripeWarning}>
                    <Ionicons name="warning" size={18} color="#92400e" />
                    <Text style={styles.stripeWarningText}>Connect Stripe to accept jobs and receive payments.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('OnboardingIntro')}>
                        <Text style={styles.connectLink}>Connect →</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView 
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#14b8a6" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats & Filters */}
                {jobs.length > 0 && (
                    <View style={styles.topSection}>
                        <View style={styles.statsRow}>
                            <Text style={styles.statItem}>Total: <Text style={styles.statVal}>{stats.total}</Text></Text>
                            {stats.assigned > 0 && <Text style={styles.statItem}>🎯 Assigned: <Text style={[styles.statVal, { color: '#2563eb' }]}>{stats.assigned}</Text></Text>}
                            <Text style={styles.statItem}>+OT: <Text style={[styles.statVal, { color: '#7c3aed' }]}>{stats.overtime}</Text></Text>
                            <Text style={styles.statItem}>Base: <Text style={styles.statVal}>{stats.base}</Text></Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8 }}>
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'assigned', label: '🎯 Assigned' },
                                { id: 'with_overtime', label: '+Overtime' },
                                { id: 'base_only', label: 'Base Only' },
                            ].map((f) => (
                                (f.id !== 'assigned' || stats.assigned > 0) && (
                                    <TouchableOpacity 
                                        key={f.id} 
                                        onPress={() => setFilter(f.id)}
                                        style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                                    >
                                        <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
                                    </TouchableOpacity>
                                )
                            ))}
                        </ScrollView>
                    </View>
                )}

                {filteredJobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="search-outline" size={40} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyTitle}>No jobs available</Text>
                        <Text style={styles.emptyText}>
                            {filter === 'all' ? `No open jobs in ${providerCity || 'your area'} right now.` : `No ${filter.replace('_', ' ')} jobs found.`}
                        </Text>
                        <TouchableOpacity style={styles.checkAgainBtn} onPress={() => { setFilter('all'); fetchJobs(); }}>
                            <Text style={styles.checkAgainText}>Check Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredJobs.map(renderJobItem)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: TEAL_DARK, paddingHorizontal: 20, paddingBottom: 20,
    },
    menuBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1, marginLeft: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', letterSpacing: -0.5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, opacity: 0.8 },
    locationText: { fontSize: 11, color: '#4ade80', fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },
    refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    
    stripeWarning: { 
        backgroundColor: '#fffbeb', borderBottomWidth: 1, borderBottomColor: '#fef3c7',
        paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10
    },
    stripeWarningText: { flex: 1, fontSize: 11, color: '#92400e', fontWeight: '600' },
    connectLink: { fontSize: 11, color: '#b45309', fontWeight: 'bold', textDecorationLine: 'underline' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: 16, fontSize: 14, color: '#64748b', fontWeight: '500' },

    topSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statItem: { fontSize: 11, color: '#94a3b8' },
    statVal: { fontWeight: 'bold', color: '#1e293b' },
    
    filterBar: { marginBottom: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    filterChipActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    filterText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    filterTextActive: { color: '#fff' },

    scroll: { padding: 16, paddingBottom: 40 },
    
    jobCard: { 
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
        borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10
    },
    assignedBanner: { 
        backgroundColor: '#eff6ff', flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#dbeafe'
    },
    assignedBannerText: { fontSize: 10, fontWeight: '700', color: '#1e40af' },
    otHeaderBanner: { 
        backgroundColor: '#7c3aed', flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12
    },
    otHeaderBannerText: { fontSize: 10, fontWeight: '700', color: '#fff' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    serviceIconContainer: { flexDirection: 'row', gap: 12, flex: 1 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    categoryEmoji: { fontSize: 20 },
    serviceTextContainer: { flex: 1 },
    serviceName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    categoryName: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    
    earningsBadge: { alignItems: 'flex-end' },
    earnLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
    earnValue: { fontSize: 22, fontWeight: '900', marginTop: 2 },

    cardMeta: { marginBottom: 16 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    metaBadgeText: { fontSize: 11, color: '#64748b', fontWeight: '700' },
    otBadge: { backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#ddd6fe' },
    otBadgeText: { fontSize: 11, color: '#7c3aed', fontWeight: '800' },

    infoGrid: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    infoItemText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
    
    accessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    accessTag: { fontSize: 10, color: '#115e59', fontWeight: '700', backgroundColor: '#f0fdfa', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ccfbf1' },
    
    commissionInfo: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    commissionText: { fontSize: 10, color: '#94a3b8', textAlign: 'center' },

    cardActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    detailsBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    detailsBtnText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
    acceptBtnFull: { flex: 1.5, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptBtnTextFull: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
    disabledBtn: { backgroundColor: '#cbd5e1' },

    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    checkAgainBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#14b8a6', borderRadius: 12 },
    checkAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default ContractorJobsScreen;
