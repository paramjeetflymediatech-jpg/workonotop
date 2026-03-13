import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

const CustomerBookingDetailsScreen = ({ route, navigation }) => {
    const { bookingId } = route.params;
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [bookingId]);

    const fetchDetails = async () => {
        try {
            const res = await apiService.customer.getBookingDetails(bookingId);
            if (res && res.data) {
                const b = Array.isArray(res.data) ? res.data[0] : res.data;
                setBooking(b);
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderCenter}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderCenter}>
                    <Text style={styles.errorText}>Could not load booking details.</Text>
                    <TouchableOpacity style={styles.backBtnError} onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtnTxt}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const imageUrl = booking.service_image
        ? (booking.service_image.startsWith('http') ? booking.service_image : `${API_BASE_URL}${booking.service_image}`)
        : null;

    const basePrice = parseFloat(booking.service_price || 0);
    const authAmount = booking.authorized_amount ? parseFloat(booking.authorized_amount) : basePrice;
    const totalAmount = basePrice + parseFloat(booking.additional_price || 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color={PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: scale(40) }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.cardInfo}>
                    <Text style={styles.serviceName}>{booking.service_name}</Text>
                    <Text style={styles.bookingNumber}>Booking #{booking.booking_number || booking.id}</Text>
                </View>

                {imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.serviceImage} />
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Location</Text>
                    <View style={styles.card}>
                        <View style={styles.iconRow}>
                            <Ionicons name="location-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>
                                {booking.address_line1}{booking.city ? `, ${booking.city}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <View style={styles.card}>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Amount held on card:</Text>
                            <Text style={styles.pricingValue}>{formatCurrency(authAmount)}</Text>
                        </View>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Base Price ({booking.standard_duration_minutes}min):</Text>
                            <Text style={styles.pricingValue}>{formatCurrency(basePrice)}</Text>
                        </View>
                        <View style={[styles.pricingRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                        </View>
                        <View style={styles.paymentStatusBox}>
                            <Text style={styles.paymentStatusLabel}>Payment Status</Text>
                            <Text style={styles.paymentStatusVal}>{booking.status === 'completed' ? 'PAID' : (booking.authorized_amount ? 'AUTHORIZED' : 'PENDING')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status Timeline</Text>
                    <View style={styles.card}>
                        {booking.status_history && booking.status_history.length > 0 ? (
                            booking.status_history.map((history, idx) => (
                                <View key={history.id} style={styles.timelineRow}>
                                    <View style={styles.timelineIndicator}>
                                        <View style={styles.timelineDot} />
                                        {idx !== booking.status_history.length - 1 && <View style={styles.timelineLine} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineStatus}>{history.status.replace('_', ' ')}</Text>
                                        <Text style={styles.timelineDate}>{new Date(history.created_at).toLocaleString()}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.timelineRow}>
                                <View style={styles.timelineIndicator}>
                                    <View style={styles.timelineDot} />
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineStatus}>{booking.status}</Text>
                                    <Text style={styles.timelineDate}>{new Date(booking.created_at).toLocaleString()}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: moderateScale(16), color: '#64748b', marginBottom: 20 },
    backBtnError: { backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    backBtnTxt: { color: '#fff', fontWeight: 'bold' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(12), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },

    scrollContent: { padding: moderateScale(20), paddingBottom: verticalScale(40) },
    
    cardInfo: { alignItems: 'center', marginBottom: verticalScale(20) },
    serviceName: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
    bookingNumber: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(5) },

    serviceImage: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(20),
        resizeMode: 'cover'
    },

    section: { marginBottom: verticalScale(25) },
    sectionTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: verticalScale(10), marginLeft: scale(5) },
    
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
    },
    iconRow: { flexDirection: 'row', alignItems: 'center' },
    cardTextVals: { fontSize: moderateScale(15), color: '#0f172a', marginLeft: scale(10), flex: 1, fontWeight: '500' },

    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: verticalScale(6) },
    pricingLabel: { fontSize: moderateScale(14), color: '#475569' },
    pricingValue: { fontSize: moderateScale(14), fontWeight: '600', color: '#0f172a' },
    totalRow: { marginTop: verticalScale(10), paddingTop: verticalScale(10), borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    totalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    totalValue: { fontSize: moderateScale(18), fontWeight: 'bold', color: PRIMARY },

    paymentStatusBox: { marginTop: verticalScale(15), backgroundColor: '#f0fdfa', padding: moderateScale(12), borderRadius: moderateScale(12), alignItems: 'center' },
    paymentStatusLabel: { fontSize: moderateScale(12), color: PRIMARY, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: verticalScale(4) },
    paymentStatusVal: { fontSize: moderateScale(16), color: PRIMARY, fontWeight: '900', letterSpacing: 1 },

    timelineRow: { flexDirection: 'row' },
    timelineIndicator: { alignItems: 'center', width: moderateScale(30) },
    timelineDot: { width: moderateScale(12), height: moderateScale(12), borderRadius: moderateScale(6), backgroundColor: PRIMARY, zIndex: 2 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginVertical: verticalScale(4) },
    timelineContent: { flex: 1, paddingBottom: verticalScale(20), paddingTop: verticalScale(-2) },
    timelineStatus: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a', textTransform: 'capitalize' },
    timelineDate: { fontSize: moderateScale(12), color: '#64748b', marginTop: verticalScale(2) },
});

export default CustomerBookingDetailsScreen;
