import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

// ── Status config (mirrors web exactly) ──────────────────────────────────────
const statusConfig = {
    pending:           { label: 'Pending',               dot: '#facc15', bg: '#fefce8', text: '#a16207', border: '#fef08a' },
    matching:          { label: 'Finding Provider',      dot: '#fb923c', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    confirmed:         { label: 'Confirmed',             dot: '#60a5fa', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    in_progress:       { label: 'In Progress',           dot: '#a78bfa', bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    awaiting_approval: { label: 'Needs Your Approval',  dot: '#fbbf24', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    completed:         { label: 'Completed',             dot: '#22c55e', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    cancelled:         { label: 'Cancelled',             dot: '#f87171', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    disputed:          { label: 'Disputed',              dot: '#dc2626', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
};

const getStatus = (s) => statusConfig[s] || { label: s, dot: '#94a3b8', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };

const formatSlot = (slot) => {
    const map = { morning: '8:00 AM – 12:00 PM', afternoon: '12:00 PM – 5:00 PM', evening: '5:00 PM – 9:00 PM' };
    if (Array.isArray(slot)) return map[slot[0]] || slot[0];
    return map[slot] || slot;
};

const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
};

// ── BookingCard ───────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onViewDetails, onChat }) => {
    const st = getStatus(booking.status);
    const needsApproval = booking.status === 'awaiting_approval';
    const canChat = booking.status === 'confirmed' || booking.status === 'in_progress';
    const providerInitial = (booking.provider_name || 'P')[0].toUpperCase();

    return (
        <View style={[styles.card, needsApproval && styles.cardApproval]}>

            {/* Amber top banner — awaiting_approval */}
            {needsApproval && (
                <View style={styles.approvalBanner}>
                    <Text style={styles.approvalBannerEmoji}>🎉</Text>
                    <Text style={styles.approvalBannerText}>Job completed — your approval needed</Text>
                    <Ionicons name="chevron-forward" size={14} color="#d97706" style={{ marginLeft: 'auto' }} />
                </View>
            )}

            <View style={styles.cardBody}>
                {/* Status row */}
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                    <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                    </View>
                    {booking.booking_number ? (
                        <Text style={styles.bookingNumber}>{booking.booking_number}</Text>
                    ) : null}
                </View>

                {/* Service name */}
                <Text style={styles.serviceName}>{booking.service_name}</Text>

                {/* Provider row */}
                <View style={styles.providerRow}>
                    <View style={styles.providerAvatar}>
                        <Text style={styles.providerAvatarText}>{providerInitial}</Text>
                    </View>
                    {booking.provider_name ? (
                        <Text style={styles.providerName}>{booking.provider_name}</Text>
                    ) : (
                        <Text style={styles.providerUnassigned}>Provider not assigned yet</Text>
                    )}
                </View>

                {/* Date + Time slot */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={13} color="#94a3b8" />
                        <Text style={styles.metaText}>{formatDate(booking.job_date)}</Text>
                    </View>
                    {booking.job_time_slot ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={13} color="#94a3b8" />
                            <Text style={styles.metaText}>{formatSlot(booking.job_time_slot)}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.viewBtn, needsApproval && styles.viewBtnApproval]}
                        onPress={() => onViewDetails(booking.id)}
                        activeOpacity={0.8}
                    >
                        {needsApproval ? (
                            <>
                                <Text style={styles.approvalEmoji}>🎉</Text>
                                <Text style={[styles.viewBtnText, { color: '#fff' }]}>Review & Approve</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="eye-outline" size={15} color="#374151" />
                                <Text style={styles.viewBtnText}>View Details</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {canChat && (
                        <TouchableOpacity style={styles.chatBtn} onPress={() => onChat(booking)} activeOpacity={0.8}>
                            <Ionicons name="chatbubble-ellipses-outline" size={15} color="#fff" />
                            <Text style={styles.chatBtnText}>Chat</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const MyBookingsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState([]);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await api.get(`/api/customer/bookings?user_id=${user?.id}`);
            setBookings(res.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) fetchBookings();
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleViewDetails = (bookingId) => {
        navigation.navigate('CustomerBookingDetails', { bookingId });
    };

    const handleChat = (booking) => {
        navigation.navigate('Chat', {
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            role: 'customer',
            otherPartyName: booking.provider_name || 'Provider',
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loaderText}>Loading your bookings…</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(22)} color={PRIMARY} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>My Bookings</Text>
                        {bookings.length > 0 && (
                            <Text style={styles.headerSubtitle}>
                                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </View>
                    <View style={{ width: scale(40) }} />
                </View>
            </View>

            <FlatList
                data={bookings}
                renderItem={({ item }) => (
                    <BookingCard
                        booking={item}
                        onViewDetails={handleViewDetails}
                        onChat={handleChat}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + verticalScale(100) }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={PRIMARY} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="receipt-outline" size={moderateScale(36)} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptySub}>Your bookings will appear here once you book a service.</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.emptyBtnTxt}>Browse Services</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderText: { marginTop: verticalScale(12), fontSize: moderateScale(14), color: '#94a3b8' },

    /* Header */
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: {
        width: moderateScale(38), height: moderateScale(38),
        borderRadius: moderateScale(11), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: '800', color: '#0f172a', textAlign: 'center' },
    headerSubtitle: { fontSize: moderateScale(12), color: '#94a3b8', textAlign: 'center', marginTop: 1 },

    listContent: { padding: moderateScale(16) },

    /* Card */
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    cardApproval: { borderColor: '#fde68a', },

    /* Approval banner (amber strip at top) */
    approvalBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        borderBottomWidth: 1,
        borderBottomColor: '#fef3c7',
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(9),
        gap: scale(6),
    },
    approvalBannerEmoji: { fontSize: 13 },
    approvalBannerText: { fontSize: moderateScale(12), fontWeight: '700', color: '#b45309', flex: 1 },

    cardBody: { padding: moderateScale(16) },

    /* Status */
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginBottom: verticalScale(10) },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusBadge: {
        paddingHorizontal: scale(10), paddingVertical: 3,
        borderRadius: 20, borderWidth: 1,
    },
    statusBadgeText: { fontSize: moderateScale(10), fontWeight: '700', letterSpacing: 0.1 },
    bookingNumber: { marginLeft: 'auto', fontSize: moderateScale(10), color: '#cbd5e1', fontWeight: '600' },

    /* Service */
    serviceName: { fontSize: moderateScale(17), fontWeight: '800', color: '#0f172a', marginBottom: verticalScale(10), lineHeight: moderateScale(22) },

    /* Provider */
    providerRow: { flexDirection: 'row', alignItems: 'center', gap: scale(7), marginBottom: verticalScale(10) },
    providerAvatar: {
        width: moderateScale(20), height: moderateScale(20), borderRadius: moderateScale(10),
        backgroundColor: '#10b981',
        justifyContent: 'center', alignItems: 'center',
    },
    providerAvatarText: { color: '#fff', fontSize: moderateScale(9), fontWeight: '800' },
    providerName: { fontSize: moderateScale(13), fontWeight: '600', color: '#374151' },
    providerUnassigned: { fontSize: moderateScale(13), fontStyle: 'italic', color: '#94a3b8' },

    /* Meta (date + time) */
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(12), marginBottom: verticalScale(14) },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
    metaText: { fontSize: moderateScale(12), color: '#94a3b8' },

    /* Buttons */
    actionRow: { flexDirection: 'row', gap: scale(8) },
    viewBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(6),
        backgroundColor: '#f3f4f6', borderRadius: moderateScale(12),
        paddingVertical: verticalScale(10),
    },
    viewBtnApproval: { backgroundColor: '#f59e0b' },
    viewBtnText: { fontSize: moderateScale(13), fontWeight: '700', color: '#374151' },
    approvalEmoji: { fontSize: 14 },
    chatBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(6),
        backgroundColor: '#16a34a', borderRadius: moderateScale(12),
        paddingVertical: verticalScale(10),
        elevation: 1, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    },
    chatBtnText: { fontSize: moderateScale(13), fontWeight: '700', color: '#fff' },

    /* Empty State */
    emptyWrap: {
        alignItems: 'center', paddingVertical: verticalScale(70),
        backgroundColor: '#fff', borderRadius: moderateScale(24),
        borderWidth: 1, borderColor: '#f1f5f9', marginTop: verticalScale(8),
    },
    emptyIconCircle: {
        width: moderateScale(72), height: moderateScale(72), borderRadius: moderateScale(36),
        backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(18),
    },
    emptyTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#0f172a' },
    emptySub: {
        textAlign: 'center', color: '#94a3b8', fontSize: moderateScale(13),
        marginTop: verticalScale(6), paddingHorizontal: moderateScale(30), lineHeight: moderateScale(20),
    },
    emptyBtn: {
        marginTop: verticalScale(22), paddingHorizontal: moderateScale(32), paddingVertical: verticalScale(13),
        backgroundColor: PRIMARY, borderRadius: moderateScale(14),
        shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
});

export default MyBookingsScreen;
