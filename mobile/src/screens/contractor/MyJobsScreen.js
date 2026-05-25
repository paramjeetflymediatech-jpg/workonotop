import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';

const TEAL_DARK = '#15843E';
const TEAL_LIGHT = '#15843E';

const MyJobsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('ongoing');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [jobs, setJobs] = useState({ ongoing: [], completed: [] });

    const fetchJobs = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await api.get('/api/provider/jobs');
            if (res.success) {
                const allJobs = res.data || [];
                setJobs({
                    ongoing: allJobs.filter(j => ['confirmed', 'in_progress'].includes(j.status)),
                    completed: allJobs.filter(j => ['completed', 'awaiting_approval', 'disputed'].includes(j.status))
                });
            }
        } catch (err) {
            console.error('Error fetching my jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchJobs(false);
        });
        return unsubscribe;
    }, [fetchJobs, navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs(false);
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

    const renderJobCard = ({ item }) => {
        const isCompleted = item.status === 'completed';
        
        const basePrice = parseFloat(item.service_price || item.pricing?.base_price || 0);
        const commPct = parseFloat(item.commission_percent ?? item.pricing?.commission_percent ?? 20);
        const baseEarnings = basePrice - (basePrice * (commPct / 100));
        const earnings = typeof item.display_amount === 'string'
            ? parseFloat(item.display_amount.replace(/[^\d.-]/g, ''))
            : (parseFloat(item.display_amount ?? item.provider_amount ?? baseEarnings));

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('JobDetails', { job: item })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{item.service_name}</Text>
                        <Text style={styles.bookingNumber}>#{item.booking_number || `BK-${item.id}`}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#ecfdf5' : '#eff6ff' }]}>
                        <Text style={[styles.statusText, { color: isCompleted ? '#10b981' : '#3b82f6' }]}>
                            {item.status?.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#64748b" />
                        <Text style={[styles.infoText, { flexShrink: 1 }]} numberOfLines={1}>
                            {formatDate(item.job_date)}
                        </Text>
                        <View style={styles.dot} />
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={[styles.infoText, { flexShrink: 1 }]} numberOfLines={1}>
                            {formatSlotPreview(item.job_time_slot)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={[styles.infoText, { flexShrink: 1 }]} numberOfLines={1}>
                            {item.address_line1 || 'Address unavailable'}
                            {item.city ? `, ${item.city}` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.earningsContainer}>
                        <Text style={styles.earningsLabel}>Earning</Text>
                        <Text style={styles.earningsValue}>${(isNaN(earnings) ? 0 : earnings).toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => navigation.navigate('JobDetails', { job: item })}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#15843E" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(8) }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Jobs</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {['ongoing', 'completed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                        <View style={[styles.tabBadge, activeTab === tab ? styles.activeBadge : styles.inactiveBadge]}>
                            <Text style={[styles.badgeText, activeTab === tab && styles.activeBadgeText]}>
                                {jobs[tab].length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#15843E" />
                </View>
            ) : (
                <FlatList
                    data={jobs[activeTab]}
                    renderItem={renderJobCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15843E']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No {activeTab} jobs found</Text>
                            <Text style={styles.emptySubText}>
                                {activeTab === 'ongoing'
                                    ? "Accept jobs from the 'Available Jobs' screen to see them here."
                                    : "Finished jobs will appear in this tab."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(18),
    },
    menuBtn: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },
    tabContainer: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 4, margin: 16, borderRadius: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10, gap: 8
    },
    activeTab: { backgroundColor: '#15843E' },
    tabText: { fontSize: Typography.body, fontWeight: '600', color: '#64748b' },
    activeTabText: { color: '#fff' },
    tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
    activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)' },
    inactiveBadge: { backgroundColor: '#f1f5f9' },
    badgeText: { fontSize: Typography.getCustom(10), fontWeight: 'bold', color: '#64748b' },
    activeBadgeText: { color: '#fff' },
    listContent: { padding: 16, paddingTop: 0 },
    card: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    serviceInfo: { flex: 1, paddingRight: 10 },
    serviceName: { fontSize: Typography.bodyLarge, fontWeight: 'bold', color: '#0f172a', flexWrap: 'wrap' },
    bookingNumber: { fontSize: Typography.caption, color: '#94a3b8', marginTop: 2, flexWrap: 'wrap' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
    statusText: { fontSize: Typography.getCustom(10), fontWeight: 'bold' },
    cardBody: { marginBottom: 16, gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: Typography.bodySmall, color: '#64748b' },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#94a3b8' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9'
    },
    earningsContainer: {},
    earningsLabel: { fontSize: Typography.tiny, color: '#94a3b8' },
    earningsValue: { fontSize: Typography.bodyLarge, fontWeight: 'bold', color: '#15843E' },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailsBtnText: { fontSize: Typography.body, fontWeight: '600', color: '#15843E' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyText: { fontSize: Typography.h5, fontWeight: 'bold', color: '#475569', marginTop: 16 },
    emptySubText: { fontSize: Typography.body, color: '#94a3b8', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});

export default MyJobsScreen;
