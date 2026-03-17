import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, Image, StatusBar, Modal, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

const CustomerBookingDetailsScreen = ({ route, navigation }) => {
    const { bookingId } = route.params;
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, [bookingId]);

    const openViewer = (url) => {
        setSelectedImage(url);
        setViewerVisible(true);
    };

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

    const handleCancel = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await apiService.post(
                                `/api/customer/bookings/${bookingId}/cancel`,
                                {},
                                user?.token
                            );
                            if (res?.success) {
                                Alert.alert('Cancelled', 'Your booking has been cancelled.', [
                                    { text: 'OK', onPress: () => { fetchDetails(); } }
                                ]);
                            } else {
                                Alert.alert('Error', res?.message || 'Could not cancel booking.');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Failed to cancel booking.');
                        }
                    },
                },
            ]
        );
    };

    const openChat = () => {
        navigation.navigate('Chat', {
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            role: 'customer',
            otherPartyName: booking.provider_name || 'Provider',
        });
    };

    const renderImageViewer = () => (
        <Modal
            visible={viewerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setViewerVisible(false)}
        >
            <View style={styles.viewerContainer}>
                <TouchableOpacity 
                    style={styles.viewerCloseBtn} 
                    onPress={() => setViewerVisible(false)}
                >
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
                {selectedImage && (
                    <Image 
                        source={{ uri: selectedImage }} 
                        style={styles.viewerImage} 
                        resizeMode="contain" 
                    />
                )}
            </View>
        </Modal>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
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
    const overtimeEarnings = parseFloat(booking.overtime_earnings || 0);
    const totalAmount = basePrice + overtimeEarnings;

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
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    <View style={styles.card}>
                        <View style={styles.iconRow}>
                            <Ionicons name="calendar-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{booking.job_date}</Text>
                        </View>
                        <View style={[styles.iconRow, { marginTop: 10 }]}>
                            <Ionicons name="time-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{booking.job_time_slot}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Location</Text>
                    <View style={styles.card}>
                        <View style={styles.iconRow}>
                            <Ionicons name="location-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>
                                {booking.address_line1}{booking.city ? `, ${booking.city}` : ''}{booking.postal_code ? `, ${booking.postal_code}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <View style={styles.card}>
                        {(booking.customer_first_name || booking.customer_last_name) && (
                            <View style={[styles.iconRow, { marginBottom: 10 }]}>
                                <Ionicons name="person-outline" size={moderateScale(20)} color={PRIMARY} />
                                <Text style={styles.cardTextVals}>{booking.customer_first_name} {booking.customer_last_name}</Text>
                            </View>
                        )}
                        <View style={styles.iconRow}>
                            <Ionicons name="call-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{booking.customer_phone}</Text>
                        </View>
                        {booking.customer_email && (
                            <View style={[styles.iconRow, { marginTop: 10 }]}>
                                <Ionicons name="mail-outline" size={moderateScale(20)} color={PRIMARY} />
                                <Text style={styles.cardTextVals}>{booking.customer_email}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {booking.provider_name && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Professional</Text>
                        <View style={styles.card}>
                            <View style={styles.iconRow}>
                                <Ionicons name="person-circle-outline" size={moderateScale(24)} color={PRIMARY} />
                                <View style={{ marginLeft: scale(10), flex: 1 }}>
                                    <Text style={[styles.cardTextVals, { marginLeft: 0 }]}>{booking.provider_name}</Text>
                                    <View style={styles.providerRatingRow}>
                                        <Ionicons name="star" size={14} color="#f59e0b" />
                                        <Text style={styles.providerRating}>{booking.provider_rating || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                            {booking.provider_phone && (
                                <View style={[styles.iconRow, { marginTop: 12 }]}>
                                    <Ionicons name="call-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>{booking.provider_phone}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {booking.job_description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <View style={styles.card}>
                            <Text style={styles.descriptionText}>{booking.job_description}</Text>
                        </View>
                    </View>
                )}

                {(booking.timing_constraints || booking.instructions) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Extra Details</Text>
                        <View style={styles.card}>
                            {booking.timing_constraints && (
                                <View style={styles.iconRow}>
                                    <Ionicons name="hourglass-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>Limits: {booking.timing_constraints}</Text>
                                </View>
                            )}
                            {booking.instructions && (
                                <View style={[styles.iconRow, { marginTop: 10 }]}>
                                    <Ionicons name="information-circle-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>Notes: {booking.instructions}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Access & Amenities</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, booking.parking_access && styles.badgeActive]}>
                            <Ionicons name="car-outline" size={12} color={booking.parking_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.parking_access && styles.badgeTextActive]}>Parking</Text>
                        </View>
                        <View style={[styles.badge, booking.elevator_access && styles.badgeActive]}>
                            <Ionicons name="business-outline" size={12} color={booking.elevator_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.elevator_access && styles.badgeTextActive]}>Elevator</Text>
                        </View>
                        <View style={[styles.badge, booking.has_pets && styles.badgeActive]}>
                            <Ionicons name="paw-outline" size={12} color={booking.has_pets ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.has_pets && styles.badgeTextActive]}>Pets</Text>
                        </View>
                    </View>
                </View>

                {booking.photos && booking.photos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Job Photos</Text>
                        <View style={styles.photoGrid}>
                            {booking.photos.map((url, idx) => {
                                const photoUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
                                return (
                                    <TouchableOpacity key={idx} onPress={() => openViewer(photoUrl)}>
                                        <Image source={{ uri: photoUrl }} style={styles.photoMini} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

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
                        {overtimeEarnings > 0 && (
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Additional Earnings:</Text>
                                <Text style={styles.pricingValue}>{formatCurrency(overtimeEarnings)}</Text>
                            </View>
                        )}
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

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    {['confirmed', 'in_progress'].includes(booking.status) && booking.provider_name && (
                        <TouchableOpacity style={styles.chatBtn} onPress={openChat} activeOpacity={0.8}>
                            <Ionicons name="chatbubble-ellipses-outline" size={moderateScale(18)} color="#fff" />
                            <Text style={styles.chatBtnText}>Chat with Provider</Text>
                        </TouchableOpacity>
                    )}
                    {booking.status === 'pending' && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                            <Ionicons name="close-circle-outline" size={moderateScale(18)} color="#b91c1c" />
                            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                        </TouchableOpacity>
                    )}
                </View>

            </ScrollView>
            {renderImageViewer()}
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
        paddingVertical: verticalScale(15),
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

    descriptionText: { fontSize: moderateScale(15), color: '#334155', lineHeight: verticalScale(22) },
    extraText: { fontSize: moderateScale(14), color: '#475569', marginLeft: scale(10), flex: 1 },
    providerRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    providerRating: { fontSize: moderateScale(13), color: '#64748b', marginLeft: 4 },

    /* Badge Styles */
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    badgeActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    badgeText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#64748b' },
    badgeTextActive: { color: '#fff' },

    /* Photo Grid */
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    photoMini: { width: scale(80), height: scale(80), borderRadius: 12 },

    /* Action Buttons */
    actionsRow: { gap: verticalScale(12), marginBottom: verticalScale(30), marginTop: verticalScale(4) },
    chatBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: PRIMARY, borderRadius: moderateScale(14),
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
        elevation: 2, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
    },
    chatBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff', borderRadius: moderateScale(14),
        borderWidth: 2, borderColor: '#fca5a5',
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
    },
    cancelBtnText: { color: '#b91c1c', fontWeight: '700', fontSize: moderateScale(15) },

    /* Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    viewerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },
});

export default CustomerBookingDetailsScreen;
