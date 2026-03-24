import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';
const TEAL_LIGHT = '#14b8a6';

const STATUS_CONFIG = {
    confirmed: { bg: '#dbeafe', text: '#1d4ed8', label: 'Confirmed' },
    in_progress: { bg: '#f3e8ff', text: '#7c3aed', label: 'In Progress' },
    completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
    pending: { bg: '#fef3c7', text: '#b45309', label: 'Pending' },
    cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
};

const ProviderMessagesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState([]);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await apiService.provider.getMyBookings(user?.token);
            if (res?.success) {
                // Only show bookings that have a customer to chat with
                const chatable = (res.data || res.bookings || []).filter(
                    b => ['confirmed', 'in_progress', 'completed'].includes(b.status)
                );
                setBookings(chatable);
            }
        } catch (err) {
            console.error('Messages bookings error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    const onRefresh = () => { setRefreshing(true); fetchBookings(); };

    const openChat = (booking) => {
        navigation.navigate('Chat', {
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            role: 'provider',
            otherPartyName: booking.customer_first_name
                ? `${booking.customer_first_name} ${booking.customer_last_name || ''}`.trim()
                : 'Customer',
        });
    };

    const renderItem = ({ item }) => {
        const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (
            <TouchableOpacity style={styles.card} onPress={() => openChat(item)} activeOpacity={0.75}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {item.customer_first_name?.[0]?.toUpperCase() || 'C'}
                    </Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.customerName}>
                        {item.customer_first_name} {item.customer_last_name}
                    </Text>
                    <Text style={styles.serviceName} numberOfLines={1}>{item.service_name}</Text>
                    <Text style={styles.dateText}>📅 {item.job_date}</Text>
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                    </View>
                    <Ionicons name="chatbubble-outline" size={moderateScale(22)} color={TEAL_LIGHT} style={styles.chatIcon} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={TEAL} />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            <FlatList
                data={bookings}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} colors={[TEAL]} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="chatbubbles-outline" size={moderateScale(52)} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No chats yet</Text>
                        <Text style={styles.emptySubText}>
                            Chat becomes available once a booking is confirmed
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
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
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(18),
    },
    menuBtn: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },

    listContent: { padding: scale(14), paddingBottom: verticalScale(30) },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: moderateScale(18),
        padding: moderateScale(14), marginBottom: verticalScale(12),
        gap: scale(12),
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5,
    },
    avatarCircle: {
        width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(23),
        backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: moderateScale(18), fontWeight: '800', color: TEAL },
    cardBody: { flex: 1 },
    customerName: { fontSize: moderateScale(15), fontWeight: '700', color: '#0f172a' },
    serviceName: { fontSize: moderateScale(12), color: '#64748b', marginTop: 2 },
    dateText: { fontSize: moderateScale(11), color: '#94a3b8', marginTop: 4 },

    cardRight: { alignItems: 'flex-end', gap: verticalScale(8) },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: moderateScale(10), fontWeight: '800', textTransform: 'uppercase' },
    chatIcon: { marginTop: 2 },

    emptyBox: { flex: 1, alignItems: 'center', paddingTop: verticalScale(80), paddingHorizontal: scale(30) },
    emptyText: { fontSize: moderateScale(17), fontWeight: '700', color: '#334155', marginTop: verticalScale(14) },
    emptySubText: { fontSize: moderateScale(13), color: '#94a3b8', marginTop: 8, textAlign: 'center', lineHeight: moderateScale(18) },
});

export default ProviderMessagesScreen;
