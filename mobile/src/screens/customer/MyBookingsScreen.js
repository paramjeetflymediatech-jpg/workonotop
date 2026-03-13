import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

const getStatusStyle = (status) => {
    switch (status) {
        case 'pending': return { bg: '#fef3c7', text: '#d97706', label: 'Pending' };
        case 'confirmed': return { bg: '#dbeafe', text: '#2563eb', label: 'Confirmed' };
        case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea', label: 'In Progress' };
        case 'completed': return { bg: '#dcfce7', text: '#16a34a', label: 'Completed' };
        case 'cancelled': return { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' };
        default: return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
};

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

    const renderBookingItem = ({ item: booking }) => {
        const status = getStatusStyle(booking.status);
        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('CustomerBookingDetails', { bookingId: booking.id })}
                activeOpacity={0.7}
            >
                <View style={styles.orderIcon}>
                    <Ionicons name="construct" size={moderateScale(24)} color={PRIMARY} />
                </View>
                <View style={styles.orderMid}>
                    <Text style={styles.orderName}>{booking.service_name}</Text>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={moderateScale(12)} color="#94a3b8" />
                        <Text style={styles.orderDate}>{new Date(booking.job_date).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={[styles.orderStatus, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusTxtTag, { color: status.text }]}>{status.label}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loaderText}>Loading your bookings...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={PRIMARY} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <View style={{ width: scale(40) }} />
                </View>
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { pb: insets.bottom + verticalScale(100) }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={PRIMARY} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="receipt-outline" size={moderateScale(40)} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptySub}>Your bookings will appear here once you book a service.</Text>
                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => navigation.navigate('Services')}
                        >
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
    loaderText: { marginTop: verticalScale(15), fontSize: moderateScale(16), color: '#64748b', fontWeight: '500' },
    
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },

    listContent: { padding: moderateScale(20) },

    /* Booking Card */
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(22),
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    orderIcon: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(16),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderMid: { flex: 1, marginLeft: scale(15) },
    orderName: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(4) },
    orderDate: { fontSize: moderateScale(12), color: '#94a3b8', marginLeft: scale(4) },
    orderStatus: {
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(12),
    },
    statusTxtTag: { fontSize: moderateScale(11), fontWeight: '800', textTransform: 'uppercase' },

    /* Empty State */
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: verticalScale(60),
        marginTop: verticalScale(20),
        backgroundColor: '#fff',
        borderRadius: moderateScale(30),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    emptyIconCircle: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    emptyTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    emptySub: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: moderateScale(14),
        marginTop: verticalScale(8),
        paddingHorizontal: moderateScale(30),
        lineHeight: moderateScale(20),
    },
    emptyBtn: {
        marginTop: verticalScale(25),
        paddingHorizontal: moderateScale(35),
        paddingVertical: verticalScale(14),
        backgroundColor: PRIMARY,
        borderRadius: moderateScale(15),
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(16) },
});

export default MyBookingsScreen;
