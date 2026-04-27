import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
const TEAL = '#0f766e';
const TEAL_DARK = '#15843E';
const TEAL_LIGHT = '#15843E';

const EarningsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchEarnings = useCallback(async () => {
        try {
            const res = await apiService.provider.getPayouts(user?.token);
            if (res?.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Earnings fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token]);

    useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

    const onRefresh = () => { setRefreshing(true); fetchEarnings(); };

    const fmt = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    const balances = data?.balances || {};
    const payouts = data?.payouts || [];
    const recentJobs = data?.recent_jobs || [];
    const stripeStatus = data?.provider?.stripe_onboarding || 'incomplete';

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={TEAL} />
                    <Text style={styles.loadingText}>Loading earnings...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(8) }]}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Earnings</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} colors={[TEAL]} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stripe Status */}
                <View style={[styles.stripeBadge, { backgroundColor: stripeStatus === 'complete' ? '#dcfce7' : '#fef3c7' }]}>
                    <Ionicons
                        name={stripeStatus === 'complete' ? 'checkmark-circle' : 'warning'}
                        size={moderateScale(16)}
                        color={stripeStatus === 'complete' ? '#16a34a' : '#d97706'}
                    />
                    <Text style={[styles.stripeText, { color: stripeStatus === 'complete' ? '#16a34a' : '#d97706' }]}>
                        Stripe Payout: {stripeStatus === 'complete' ? 'Account Connected' : 'Setup Incomplete'}
                    </Text>
                </View>

                {/* Balance Cards */}
                <View style={styles.balanceGrid}>
                    <View style={[styles.balanceCard, { backgroundColor: TEAL_DARK }]}>
                        <Ionicons name="wallet-outline" size={moderateScale(28)} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.balanceAmount}>{fmt(balances.available_balance)}</Text>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                    </View>
                    <View style={[styles.balanceCard, { backgroundColor: '#1d4ed8' }]}>
                        <Ionicons name="hourglass-outline" size={moderateScale(28)} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.balanceAmount}>{fmt(balances.pending_balance)}</Text>
                        <Text style={styles.balanceLabel}>Pending</Text>
                    </View>
                </View>

                {/* Total Lifetime */}
                <View style={styles.lifetimeCard}>
                    <View>
                        <Text style={styles.lifetimeLabel}>Total Lifetime Earnings</Text>
                        <Text style={styles.lifetimeAmount}>{fmt(balances.lifetime_balance || balances.total_earnings)}</Text>
                    </View>
                    <View style={styles.lifetimeIcon}>
                        <Ionicons name="trending-up-outline" size={moderateScale(30)} color={TEAL} />
                    </View>
                </View>

                {/* Recent Jobs */}
                {recentJobs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Completed Jobs</Text>
                        <View style={styles.card}>
                            {recentJobs.map((job, idx) => (
                                <View key={idx} style={[styles.jobRow, idx < recentJobs.length - 1 && styles.rowBorder]}>
                                    <View style={styles.jobIcon}>
                                        <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color={TEAL} />
                                    </View>
                                    <View style={styles.jobInfo}>
                                        <Text style={styles.jobName} numberOfLines={1}>{job.service_name}</Text>
                                        <Text style={styles.jobDate}>{fmtDate(job.end_time)}</Text>
                                    </View>
                                    <Text style={styles.jobAmount}>{fmt(job.amount)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Payout History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payout History</Text>
                    {payouts.length > 0 ? (
                        <View style={styles.card}>
                            {payouts.map((p, idx) => (
                                <View key={idx} style={[styles.jobRow, idx < payouts.length - 1 && styles.rowBorder]}>
                                    <View style={[styles.jobIcon, { backgroundColor: p.status === 'paid' ? '#dcfce7' : '#fef3c7' }]}>
                                        <Ionicons
                                            name={p.status === 'paid' ? 'cash-outline' : 'time-outline'}
                                            size={moderateScale(18)}
                                            color={p.status === 'paid' ? '#16a34a' : '#d97706'}
                                        />
                                    </View>
                                    <View style={styles.jobInfo}>
                                        <Text style={styles.jobName}>Payout</Text>
                                        <Text style={styles.jobDate}>{fmtDate(p.created_at)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.jobAmount}>{fmt(p.amount)}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: p.status === 'paid' ? '#dcfce7' : '#fef3c7' }]}>
                                            <Text style={[styles.statusText, { color: p.status === 'paid' ? '#16a34a' : '#d97706' }]}>
                                                {p.status?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyBox}>
                            <Ionicons name="cash-outline" size={moderateScale(44)} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No payouts yet</Text>
                            <Text style={styles.emptySubText}>Complete jobs to start earning!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(10), color: '#64748b', fontSize: moderateScale(14) },

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

    scrollContent: { padding: scale(16), paddingBottom: verticalScale(60) },

    stripeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        padding: moderateScale(12), borderRadius: moderateScale(12), marginBottom: verticalScale(16),
    },
    stripeText: { fontSize: moderateScale(13), fontWeight: '600' },

    balanceGrid: { flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(12) },
    balanceCard: {
        flex: 1, borderRadius: moderateScale(20), padding: moderateScale(18),
        alignItems: 'flex-start', gap: verticalScale(8),
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8,
    },
    balanceAmount: { fontSize: moderateScale(22), fontWeight: '800', color: '#fff' },
    balanceLabel: { fontSize: moderateScale(11), color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    lifetimeCard: {
        backgroundColor: '#fff', borderRadius: moderateScale(18), padding: moderateScale(20),
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: verticalScale(20),
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
    },
    lifetimeLabel: { fontSize: moderateScale(13), color: '#64748b', fontWeight: '600', marginBottom: verticalScale(4) },
    lifetimeAmount: { fontSize: moderateScale(26), fontWeight: '800', color: TEAL_DARK },
    lifetimeIcon: {
        width: moderateScale(56), height: moderateScale(56), borderRadius: moderateScale(18),
        backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
    },

    section: { marginBottom: verticalScale(20) },
    sectionTitle: { fontSize: moderateScale(15), fontWeight: '700', color: '#0f172a', marginBottom: verticalScale(10) },

    card: {
        backgroundColor: '#fff', borderRadius: moderateScale(18), overflow: 'hidden',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6,
    },
    jobRow: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(14) },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    jobIcon: {
        width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(12),
        backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center', marginRight: scale(12),
    },
    jobInfo: { flex: 1 },
    jobName: { fontSize: moderateScale(14), fontWeight: '600', color: '#0f172a' },
    jobDate: { fontSize: moderateScale(12), color: '#94a3b8', marginTop: 2 },
    jobAmount: { fontSize: moderateScale(15), fontWeight: '700', color: TEAL_DARK },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
    statusText: { fontSize: moderateScale(10), fontWeight: '800' },

    emptyBox: { backgroundColor: '#fff', borderRadius: moderateScale(18), padding: moderateScale(40), alignItems: 'center' },
    emptyText: { fontSize: moderateScale(16), fontWeight: '700', color: '#334155', marginTop: verticalScale(12) },
    emptySubText: { fontSize: moderateScale(13), color: '#94a3b8', marginTop: 6 },
});

export default EarningsScreen;
