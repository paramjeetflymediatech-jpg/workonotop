import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const PRIMARY = '#115e59'; // Deep Teal
const PRIMARY_LIGHT = '#14b8a6'; // Teal
const ACCENT = '#f59e0b'; // Amber
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

const CustomerDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);

    const fetchCustomerData = useCallback(async () => {
        try {
            const [categoriesRes, bookingsRes] = await Promise.all([
                api.get('/api/categories'),
                api.get(`/api/customer/bookings?user_id=${user?.id}`)
            ]);

            setCategories(categoriesRes.data || []);
            setBookings(bookingsRes.data || []);
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchCustomerData();
        }
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCustomerData();
    };


    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loaderText}>Curating your spaces...</Text>
            </View>
        );
    }

    const firstName = user?.first_name || 'Friend';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={PRIMARY} />
                }
            >
                {/* --- HEADER SECTION --- */}
                <View style={[styles.headerGradient, { paddingTop: insets.top || verticalScale(20) }]}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greetingText}>Good Day,</Text>
                            <Text style={styles.nameText}>{firstName} ✨</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.avatarWrap}>
                                <Text style={styles.avatarTxt}>{firstName.charAt(0)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={() => navigation.navigate('Services')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="search-outline" size={moderateScale(20)} color="#94a3b8" />
                        <Text style={styles.searchTxt}>What service do you need today?</Text>
                    </TouchableOpacity>
                </View>

                {/* --- PROMO CAROUSEL --- */}
                <View style={styles.promoSection}>
                    <View style={styles.promoCard}>
                        <View style={styles.promoInfo}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>LIMITED OFFER</Text>
                            </View>
                            <Text style={styles.promoTitle}>Home Revive{'\n'}Package</Text>
                            <Text style={styles.promoSub}>Get 20% off on all deep cleaning services this week.</Text>
                            <TouchableOpacity style={styles.promoBtnAction}>
                                <Text style={styles.promoBtnText}>Claim Now</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.promoImagePlaceholder}>
                            <Text style={{ fontSize: moderateScale(60) }}>🏠</Text>
                        </View>
                    </View>
                </View>

                {/* --- CATEGORIES --- */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explore Services</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.viewAllBtn}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {(categories.length > 0 ? categories : [
                            { id: 1, name: 'Plumbing', icon: '🚰', color: '#3b82f6' },
                            { id: 2, name: 'Electric', icon: '⚡', color: '#f59e0b' },
                            { id: 3, name: 'Cleaning', icon: '🧹', color: '#ec4899' },
                            { id: 4, name: 'Painting', icon: '🎨', color: '#8b5cf6' },
                            { id: 5, name: 'AC Repair', icon: '❄️', color: '#06b6d4' },
                        ]).map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.catCard}
                                onPress={() => navigation.navigate('Services', { categoryId: cat.id })}
                            >
                                <View style={[styles.catIconWrap, { backgroundColor: (cat.color || PRIMARY) + '15' }]}>
                                    <Text style={styles.catEmoji}>{cat.icon || '🛠️'}</Text>
                                </View>
                                <Text style={styles.catName}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* --- ACTIVE BOOKINGS --- */}
                <View style={[styles.section, { marginBottom: verticalScale(40) }]}>
                    <Text style={[styles.sectionTitle, { marginLeft: moderateScale(20), marginBottom: verticalScale(15) }]}>My Active Orders</Text>

                    {bookings.length > 0 ? (
                        bookings.slice(0, 3).map((booking) => {
                            const status = getStatusStyle(booking.status);
                            return (
                                <TouchableOpacity
                                    key={booking.id}
                                    style={styles.orderCard}
                                    onPress={() => navigation.navigate('Details', { bookingId: booking.id })}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.orderIcon}>
                                        <Ionicons name="construct" size={moderateScale(24)} color={PRIMARY} />
                                    </View>
                                    <View style={styles.orderMid}>
                                        <Text style={styles.orderName}>{booking.service_name}</Text>
                                        <Text style={styles.orderDate}>
                                            <Ionicons name="calendar-outline" size={moderateScale(12)} /> {new Date(booking.job_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={[styles.orderStatus, { backgroundColor: status.bg }]}>
                                        <Text style={[styles.statusTxtTag, { color: status.text }]}>{status.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyWrap}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="receipt-outline" size={moderateScale(40)} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyTitle}>No active bookings</Text>
                            <Text style={styles.emptySub}>You haven't scheduled any services yet. Start by exploring our top-rated professionals.</Text>
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate('Services')}
                            >
                                <Text style={styles.emptyBtnTxt}>Find a Pro</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Bottom padding for tab bar visibility */}
                <View style={{ height: verticalScale(100) + insets.bottom }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderText: { marginTop: verticalScale(15), fontSize: moderateScale(16), color: '#64748b', fontWeight: '500' },

    /* Header */
    headerGradient: {
        backgroundColor: PRIMARY,
        borderBottomLeftRadius: moderateScale(35),
        borderBottomRightRadius: moderateScale(35),
        paddingHorizontal: moderateScale(25),
        paddingBottom: verticalScale(35),
        elevation: 10,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(25),
    },
    greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: moderateScale(15), fontWeight: '500' },
    nameText: { color: '#fff', fontSize: moderateScale(28), fontWeight: 'bold' },
    profileBtn: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(18),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarWrap: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(14),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarTxt: { color: PRIMARY, fontSize: moderateScale(18), fontWeight: 'bold' },

    /* Search */
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        height: verticalScale(55),
        borderRadius: moderateScale(20),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    searchTxt: { color: '#94a3b8', marginLeft: scale(12), fontSize: moderateScale(15), fontWeight: '500' },

    /* Promo Section */
    promoSection: { marginTop: verticalScale(-20), paddingHorizontal: moderateScale(20) },
    promoCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(25),
        padding: moderateScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    promoInfo: { flex: 1 },
    tag: {
        backgroundColor: ACCENT + '20',
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
        alignSelf: 'flex-start',
        marginBottom: verticalScale(8),
    },
    tagText: { color: ACCENT, fontSize: moderateScale(10), fontWeight: '800', letterSpacing: 0.5 },
    promoTitle: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#0f172a', lineHeight: moderateScale(26) },
    promoSub: { color: '#64748b', fontSize: moderateScale(13), marginVertical: verticalScale(8), lineHeight: moderateScale(18) },
    promoBtnAction: {
        backgroundColor: PRIMARY,
        paddingHorizontal: moderateScale(18),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(12),
        alignSelf: 'flex-start',
    },
    promoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(14) },
    promoImagePlaceholder: { marginLeft: scale(10) },

    /* Sections Shared */
    section: { marginTop: verticalScale(30) },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: moderateScale(25),
        marginBottom: verticalScale(15),
    },
    sectionTitle: { fontSize: moderateScale(19), fontWeight: 'bold', color: '#0f172a' },
    viewAllBtn: { color: PRIMARY_LIGHT, fontWeight: '700', fontSize: moderateScale(14) },

    /* Category Scroll */
    categoryScroll: { paddingLeft: moderateScale(25), paddingRight: moderateScale(10) },
    catCard: {
        width: moderateScale(85),
        marginRight: scale(15),
        alignItems: 'center',
    },
    catIconWrap: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(24),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    catEmoji: { fontSize: moderateScale(34) },
    catName: { fontSize: moderateScale(13), fontWeight: '600', color: '#475569', textAlign: 'center' },

    /* Orders / Bookings */
    orderCard: {
        backgroundColor: '#fff',
        marginHorizontal: moderateScale(20),
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
    orderDate: { fontSize: moderateScale(12), color: '#94a3b8', marginTop: verticalScale(4) },
    orderStatus: {
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(12),
    },
    statusTxtTag: { fontSize: moderateScale(11), fontWeight: '800', textTransform: 'uppercase' },

    /* Empty State */
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: verticalScale(40),
        marginHorizontal: moderateScale(25),
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
    emptyTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    emptySub: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: moderateScale(14),
        marginTop: verticalScale(8),
        paddingHorizontal: moderateScale(20),
        lineHeight: moderateScale(20),
    },
    emptyBtn: {
        marginTop: verticalScale(20),
        paddingHorizontal: moderateScale(30),
        paddingVertical: verticalScale(12),
        backgroundColor: PRIMARY,
        borderRadius: moderateScale(15),
    },
    emptyBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(15) },
});

export default CustomerDashboard;
