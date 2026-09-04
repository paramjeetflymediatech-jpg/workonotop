import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, StatusBar, Dimensions, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';
import { API_BASE_URL } from '../../config';

const TEAL_DARK = '#15843E';
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
    const [providerAreaNames, setProviderAreaNames] = useState([]);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dbTotal, setDbTotal] = useState(0);

    const fetchJobs = useCallback(async (silent = false, pageNum = 1) => {
        if (!silent && pageNum === 1) setLoading(true);
        if (pageNum > 1) setLoadingMore(true);

        try {
            const [jobsRes, provRes] = await Promise.all([
                api.get(`/api/provider/available-jobs?page=${pageNum}&limit=10`),
                pageNum === 1 ? api.get('/api/provider/me') : Promise.resolve(null)
            ]);

            if (provRes && provRes.success) {
                setStripeConnected(provRes.provider?.stripe_onboarding_complete || false);
            }

            if (jobsRes.success) {
                if (pageNum === 1) {
                    setJobs(jobsRes.data || []);
                } else {
                    setJobs(prev => [...prev, ...(jobsRes.data || [])]);
                }
                setHasMore(jobsRes.hasMore || false);
                setPage(pageNum);
                setDbTotal(jobsRes.total || 0);
                if (jobsRes.provider_city) setProviderCity(jobsRes.provider_city);
                if (jobsRes.provider_area_names) setProviderAreaNames(jobsRes.provider_area_names);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
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

    useEffect(() => {
        if (!loading && !stripeConnected) {
            Alert.alert(
                'Stripe Connection Required',
                'To accept jobs and receive payments, you must connect your Stripe account.',
                [
                    { text: 'Later', style: 'cancel' },
                    {
                        text: 'Connect Now',
                        onPress: () => navigation.navigate('BankLink')
                    }
                ]
            );
        }
    }, [loading, stripeConnected]);

    const onRefresh = () => { setRefreshing(true); fetchJobs(true, 1); };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchJobs(true, page + 1);
        }
    };

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
            `This job will be assigned to you immediately.\n\nYou earn: ${displayAmount}${hasOvertime ? '\n(Overtime allowed)' : ''}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept Job',
                    onPress: async () => {
                        try {
                            const res = await api.post('/api/provider/available-jobs', { booking_id: jobId });
                            if (res.success) {
                                Alert.alert('Success', '🎉 Job accepted! Check your schedule.');
                                fetchJobs(true, 1);
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
        try {
            let parsed = typeof d === 'string' && d.startsWith('[') ? JSON.parse(d) : d;
            if (typeof parsed === 'string' && parsed.includes(',')) {
                parsed = parsed.split(',').map(s => s.trim()).filter(Boolean);
            }
            const dateArr = Array.isArray(parsed) ? parsed : [parsed];
            if (dateArr.length === 0) return '';

            let dateStr = dateArr[0];
            let displayDate = dateStr;

            if (typeof dateStr === 'string' && dateStr.includes('-')) {
                const parts = dateStr.split('T')[0].split('-');
                if (parts.length === 3) {
                    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    if (!isNaN(dateObj.getTime())) {
                        const dateParts = dateObj.toDateString().split(' ');
                        if (dateParts.length >= 4) {
                            displayDate = `${dateParts[1]} ${dateParts[2]}, ${dateParts[3]}`;
                        }
                    }
                }
            }

            if (dateArr.length > 1) {
                return `${displayDate} & ${dateArr.length - 1} more`;
            }
            return displayDate;
        } catch {
            return String(d);
        }
    };

    const formatSlotPreview = (slot) => {
        if (!slot) return 'Flexible';
        try {
            let parsed = typeof slot === 'string' && slot.startsWith('[') ? JSON.parse(slot) : slot;
            if (typeof parsed === 'string' && parsed.includes(',')) {
                parsed = parsed.split(',').map(s => s.trim()).filter(Boolean);
            }
            const slotArr = Array.isArray(parsed) ? parsed : [parsed];
            if (slotArr.length === 0) return 'Flexible';

            let displaySlot = slotArr[0];
            if (typeof displaySlot === 'string' && displaySlot.includes(': ')) {
                displaySlot = displaySlot.split(': ').slice(1).join(': ');
            }

            // Add AM/PM
            displaySlot = displaySlot.replace(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/g, (match, h1, m1, h2, m2) => {
                const formatTime = (hrStr, minStr) => {
                    let hr = parseInt(hrStr, 10);
                    const ampm = hr >= 12 ? 'PM' : 'AM';
                    if (hr > 12) hr -= 12;
                    if (hr === 0) hr = 12;
                    return `${hr}:${minStr} ${ampm}`;
                };
                return `${formatTime(h1, m1)} – ${formatTime(h2, m2)}`;
            });

            if (slotArr.length > 1) {
                return `${displaySlot} & ${slotArr.length - 1} more`;
            }
            return displaySlot;
        } catch {
            return String(slot);
        }
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
        total: dbTotal || jobs.length,
        assigned: jobs.filter(j => j.is_admin_assigned).length,
        overtime: jobs.filter(j => j.pricing?.has_overtime).length,
        base: jobs.filter(j => !j.pricing?.has_overtime).length,
    };

    const renderJobItem = ({ item: job }) => {
        const dur = job.pricing?.duration_minutes || 60;
        const commPct = job.pricing?.commission_percent || 0;
        const baseEarnings = job.pricing?.provider_base_earnings || 0;
        const otRate = job.pricing?.overtime_rate || 0;
        const netOT = job.pricing?.net_overtime_rate || (otRate * (1 - commPct / 100));
        const hasOvertime = Boolean(job.pricing?.has_overtime);
        const isAdminAssigned = Boolean(job.is_admin_assigned);
        const photosCount = Array.isArray(job.photos) ? job.photos.length : 0;
        const hasAccessInfo = Boolean(job.parking_access || job.elevator_access || job.has_pets);

        const firstPhoto = job.photos?.[0] ? (job.photos[0].startsWith('http') ? job.photos[0] : `${API_BASE_URL}${job.photos[0]}`) : null;

        const cardBorderColor = isAdminAssigned ? '#bfdbfe' : (hasOvertime ? '#e9d5ff' : '#f1f5f9');
        const accentColor = isAdminAssigned ? '#2563eb' : '#15843E';

        return (
            <View key={job.id} style={[styles.jobCard, { borderColor: cardBorderColor, borderWidth: hasOvertime ? 1.5 : 1 }]}>
                {isAdminAssigned && (
                    <View style={styles.assignedBanner}>
                        <Ionicons name="sparkles" size={14} color="#1d4ed8" />
                        <Text style={styles.assignedBannerText}>Assigned to you by admin — waiting for acceptance</Text>
                    </View>
                )}

                {/* {hasOvertime && !isAdminAssigned && (
                    <View style={styles.otHeaderBanner}>
                        <Ionicons name="alert-circle" size={14} color="#fff" />
                        <Text style={styles.otHeaderBannerText}>⏰ Overtime eligible — max 2 hours at ${netOT.toFixed(2)}/hr</Text>
                    </View>
                )} */}

                <View style={styles.cardHeader}>
                    <View style={styles.serviceIconContainer}>
                        {firstPhoto ? (
                            <View style={styles.thumbnailContainer}>
                                <Image source={{ uri: firstPhoto }} style={styles.thumbnailImage} />
                                {photosCount > 1 && (
                                    <View style={styles.thumbnailOverlay}>
                                        <Text style={styles.thumbnailOverlayText}>+{photosCount - 1}</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={[styles.iconBox, { backgroundColor: isAdminAssigned ? '#eff6ff' : (hasOvertime ? '#faf5ff' : '#f0fdf4'), borderColor: isAdminAssigned ? '#dbeafe' : (hasOvertime ? '#f3e8ff' : '#dcfce7') }]}>
                                {job.category_icon ? (
                                    <Ionicons name={job.category_icon} size={20} color={isAdminAssigned ? '#2563eb' : (hasOvertime ? '#9333ea' : '#16a34a')} />
                                ) : (
                                    <Text style={styles.categoryEmoji}>🔧</Text>
                                )}
                            </View>
                        )}
                        <View style={styles.serviceTextContainer}>
                            <Text style={styles.serviceName} numberOfLines={1}>{job.service_name}</Text>
                            <Text style={styles.categoryName}>{job.category_name}</Text>
                        </View>
                    </View>
                    <View style={styles.earningsBadge}>
                        <Text style={styles.earnLabel}>YOU EARN</Text>
                        <Text style={styles.earnValue}>${baseEarnings.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.cardMeta}>
                    <View style={styles.badgeRow}>
                        <View style={styles.metaBadgeBlue}>
                            <Ionicons name="time" size={12} color="#1d4ed8" />
                            <Text style={styles.metaBadgeBlueText}>{formatDuration(dur)}</Text>
                        </View>
                        {hasOvertime && (
                            <View style={styles.metaBadgePurple}>
                                <Text style={styles.metaBadgePurpleText}>⏰ +${netOT.toFixed(2)}/hr OT</Text>
                            </View>
                        )}
                    </View>

                    {hasOvertime && (
                        <View style={styles.otPotentialBlock}>
                            <View style={styles.otAvailableTag}>
                                <Ionicons name="time" size={12} color="#b45309" />
                                <Text style={styles.otAvailableTagText}>Overtime Available</Text>
                            </View>
                            <Text style={styles.otPotentialTitle}>Overtime earnings potential:</Text>
                            <View style={styles.otPotentialBox}>
                                <Text style={styles.otPotentialBoxText}>1hr OT: ${(baseEarnings + netOT).toFixed(2)}</Text>
                            </View>
                            <Text style={styles.otNetRateText}>Net rate ${netOT.toFixed(2)}/hr</Text>
                        </View>
                    )}

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>📅</Text>
                            <Text style={styles.infoItemText}>{formatDate(job.job_date)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>🕐</Text>
                            <Text style={styles.infoItemText} numberOfLines={1}>{formatSlotPreview(job.job_time_slot)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>📍</Text>
                            <Text style={styles.infoItemText} numberOfLines={1}>{job.address_line1?.split(',')[0]}</Text>
                        </View>
                        {job.service_area_name && (
                            <View style={styles.infoBadgeIndigo}>
                                <Text style={styles.infoIcon}>🗺️</Text>
                                <Text style={styles.infoBadgeIndigoText}>{job.service_area_group ? `${job.service_area_group} - ${job.service_area_name}` : job.service_area_name}</Text>
                            </View>
                        )}
                        {photosCount > 0 && (
                            <View style={styles.infoBadgeBlue}>
                                <Text style={styles.infoIcon}>📷</Text>
                                <Text style={styles.infoBadgeBlueText}>{photosCount} Photo{photosCount > 1 ? 's' : ''}</Text>
                            </View>
                        )}
                    </View>

                    {hasAccessInfo && (
                        <View style={styles.accessRow}>
                            {Boolean(job.parking_access) && <Text style={styles.accessTagGreen}>🅿️ Parking</Text>}
                            {Boolean(job.elevator_access) && <Text style={styles.accessTagGreen}>🛗 Elevator</Text>}
                            {Boolean(job.has_pets) && <Text style={styles.accessTagAmber}>🐕 Pets</Text>}
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('JobDetails', { job })}>
                        <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.acceptBtnFull, { backgroundColor: accentColor }, !stripeConnected && styles.disabledBtn]} onPress={() => acceptJob(job.id, hasOvertime, `$${baseEarnings.toFixed(2)}`)}>
                        <Text style={styles.acceptBtnTextFull}>{!stripeConnected ? '🔒 Connect Stripe' : (isAdminAssigned ? 'Accept Task' : `Accept — $${baseEarnings.toFixed(2)}`)}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#15843E" />
                <Text style={styles.loaderText}>Finding jobs near you...</Text>
            </View>
        );
    }

    const ListHeader = () => (
        <>
            {/* Stats & Filters */}
            {jobs.length > 0 ? (
                <View style={styles.topSection}>
                    <View style={styles.statsRow}>
                        <Text style={styles.statItem}>Total: <Text style={styles.statVal}>{stats.total}</Text></Text>
                        {stats.assigned > 0 ? (
                            <Text style={styles.statItem}>🎯 Assigned: <Text style={[styles.statVal, { color: '#2563eb' }]}>{stats.assigned}</Text></Text>
                        ) : null}
                        <Text style={styles.statItem}>+OT: <Text style={[styles.statVal, { color: '#15843E' }]}>{stats.overtime}</Text></Text>
                        <Text style={styles.statItem}>Base: <Text style={styles.statVal}>{stats.base}</Text></Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8 }}>
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'assigned', label: '🎯 Assigned' },
                            { id: 'with_overtime', label: '+Overtime' },
                            { id: 'base_only', label: 'Base Only' },
                        ].map((f) => {
                            const showChip = f.id !== 'assigned' || stats.assigned > 0;
                            if (!showChip) return null;
                            return (
                                <TouchableOpacity
                                    key={f.id}
                                    onPress={() => setFilter(f.id)}
                                    style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                                >
                                    <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            ) : null}
        </>
    );

    const getAreaDisplay = () => {
        if (filter !== 'all') return filter.replace('_', ' ');
        if (providerAreaNames && providerAreaNames.length > 0) {
            if (providerAreaNames.length <= 2) return providerAreaNames.join(', ');
            return `${providerAreaNames.slice(0, 2).join(', ')} + ${providerAreaNames.length - 2} more`;
        }
        return providerCity || 'your area';
    };

    const ListEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No jobs available</Text>
            <Text style={styles.emptyText}>
                {filter === 'all' ? `No open jobs in ${getAreaDisplay()} right now.` : `No ${filter.replace('_', ' ')} jobs found.`}
            </Text>
            <TouchableOpacity style={styles.checkAgainBtn} onPress={() => { setFilter('all'); fetchJobs(false, 1); }}>
                <Text style={styles.checkAgainText}>Check Again</Text>
            </TouchableOpacity>
        </View>
    );

    const ListFooter = () => {
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#15843E" />
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Loading more jobs...</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(8) }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Available Jobs</Text>
                <TouchableOpacity onPress={() => onRefresh()} disabled={refreshing} style={styles.menuBtn}>
                    <Ionicons name="refresh" size={moderateScale(24)} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stripe Banner */}
            {!stripeConnected && (
                <View style={styles.stripeWarning}>
                    <Ionicons name="warning" size={18} color="#92400e" />
                    <Text style={styles.stripeWarningText}>Connect Stripe to accept jobs and receive payments.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('BankLink')}>
                        <Text style={styles.connectLink}>Connect →</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJobItem}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#15843E" />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                ListFooterComponent={ListFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: TEAL_DARK, paddingHorizontal: scale(20), paddingBottom: verticalScale(18),
    },
    menuBtn: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },

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
    statItem: { fontSize: Typography.getCustom(14), color: 'black' },
    statVal: { fontWeight: 'bold', color: '#1e293b' },

    filterBar: { marginBottom: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    filterChipActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    filterText: { fontSize: Typography.getCustom(14), color: '#000000ff', fontWeight: '600' },
    filterTextActive: { color: '#fff' },

    scroll: { padding: 16, paddingBottom: 40 },

    jobCard: {
        backgroundColor: '#fff', borderRadius: 20, marginBottom: 16,
        borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden'
    },
    assignedBanner: {
        backgroundColor: '#eff6ff', flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#dbeafe'
    },
    assignedBannerText: { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
    otHeaderBanner: {
        backgroundColor: '#0f766e', flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0f766e'
    },
    otHeaderBannerText: { fontSize: 11, fontWeight: '700', color: '#fff' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
    serviceIconContainer: { flexDirection: 'row', gap: 12, flex: 1 },

    thumbnailContainer: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    thumbnailImage: { width: '100%', height: '100%' },
    thumbnailOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 2, alignItems: 'center' },
    thumbnailOverlayText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    categoryEmoji: { fontSize: 20 },

    serviceTextContainer: { flex: 1, justifyContent: 'center' },
    serviceName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    categoryName: { fontSize: 12, color: '#64748b', marginTop: 2 },

    earningsBadge: { alignItems: 'flex-end', marginLeft: 12 },
    earnLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' },
    earnValue: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 2 },

    cardMeta: { paddingHorizontal: 16, paddingBottom: 12 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    metaBadgeBlue: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#dbeafe' },
    metaBadgeBlueText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
    metaBadgePurple: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#faf5ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f3e8ff' },
    metaBadgePurpleText: { fontSize: 12, color: '#7e22ce', fontWeight: '700' },

    otPotentialBlock: { backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#f3e8ff', borderRadius: 12, padding: 12, marginBottom: 12 },
    otAvailableTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
    otAvailableTagText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
    otPotentialTitle: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6 },
    otPotentialBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 },
    otPotentialBoxText: { fontSize: 11, fontWeight: '700', color: '#334155' },
    otNetRateText: { fontSize: 11, color: '#94a3b8' },

    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoIcon: { fontSize: 12 },
    infoItemText: { fontSize: 12, color: '#334155', fontWeight: '500' },
    infoBadgeIndigo: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    infoBadgeIndigoText: { fontSize: 11, color: '#4338ca', fontWeight: '600' },
    infoBadgeBlue: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    infoBadgeBlueText: { fontSize: 11, color: '#2563eb', fontWeight: '700' },

    accessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    accessTagGreen: { fontSize: 10, color: '#15803d', fontWeight: '600', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
    accessTagAmber: { fontSize: 10, color: '#b45309', fontWeight: '600', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },

    cardActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16, marginTop: 4 },
    detailsBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    detailsBtnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
    acceptBtnFull: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptBtnTextFull: { fontSize: 14, fontWeight: '700', color: '#fff' },
    disabledBtn: { backgroundColor: '#cbd5e1' },

    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: Typography.h5, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    emptyText: { fontSize: Typography.bodySmall, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40, lineHeight: Typography.getLineHeight(Typography.bodySmall) },
    checkAgainBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#15843E', borderRadius: 12 },
    checkAgainText: { color: '#fff', fontWeight: 'bold', fontSize: Typography.body }
});

export default ContractorJobsScreen;
