import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, SafeAreaView, RefreshControl, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';

const TEAL_DARK = '#134e4a';
const TEAL_LIGHT = '#14b8a6';

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

    const renderJobCard = ({ item }) => {
        const isCompleted = item.status === 'completed';

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
                        <Text style={styles.infoText}>{new Date(item.job_date).toLocaleDateString()}</Text>
                        <View style={styles.dot} />
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={styles.infoText}>{Array.isArray(item.job_time_slot) ? item.job_time_slot[0] : (item.job_time_slot || 'Flexible')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.address_line1 || 'Address unavailable'}
                            {item.city ? `, ${item.city}` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.earningsContainer}>
                        <Text style={styles.earningsLabel}>Earning</Text>
                        <Text style={styles.earningsValue}>${parseFloat(item.display_amount ?? item.provider_amount ?? 0).toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => navigation.navigate('JobDetails', { job: item })}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#14b8a6" />
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
                    <ActivityIndicator size="large" color="#14b8a6" />
                </View>
            ) : (
                <FlatList
                    data={jobs[activeTab]}
                    renderItem={renderJobCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14b8a6']} />
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
    activeTab: { backgroundColor: '#14b8a6' },
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
    serviceName: { fontSize: Typography.bodyLarge, fontWeight: 'bold', color: '#0f172a' },
    bookingNumber: { fontSize: Typography.caption, color: '#94a3b8', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
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
    earningsValue: { fontSize: Typography.bodyLarge, fontWeight: 'bold', color: '#14b8a6' },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailsBtnText: { fontSize: Typography.body, fontWeight: '600', color: '#14b8a6' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyText: { fontSize: Typography.h5, fontWeight: 'bold', color: '#475569', marginTop: 16 },
    emptySubText: { fontSize: Typography.body, color: '#94a3b8', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});

export default MyJobsScreen;
