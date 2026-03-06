import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const CustomerDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);

    const fetchCustomerData = async () => {
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
    };

    useEffect(() => {
        if (user?.id) {
            fetchCustomerData();
        }
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCustomerData();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea' };
            case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            case 'awaiting_approval': return { bg: '#ffedd5', text: '#ea580c' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const ServiceCategory = ({ title, icon, color, onPress }) => (
        <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
            <View style={[styles.categoryIcon, { backgroundColor: color + '15' }]}>
                {icon ? (
                    <Text style={{ fontSize: moderateScale(28) }}>{icon}</Text>
                ) : (
                    <Text style={{ fontSize: moderateScale(28) }}>🛠️</Text>
                )}
            </View>
            <Text style={styles.categoryTitle} numberOfLines={1}>{title}</Text>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loaderText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#14b8a6" />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello,</Text>
                        <Text style={styles.nameText}>{user?.first_name || 'Customer'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.first_name?.charAt(0) || 'C'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Text style={styles.searchPlaceholder}>🔍 Search for services...</Text>
                </View>

                <View style={styles.promoCard}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Easy Booking</Text>
                        <Text style={styles.promoSubtitle}>Find the best professionals for your home.</Text>
                        <TouchableOpacity style={styles.promoButton} onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.promoButtonText}>Explore Now</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.promoExtra}>🏠</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                        <Text style={styles.viewAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {categories.slice(0, 6).map((cat) => (
                        <ServiceCategory
                            key={cat.id}
                            title={cat.name}
                            icon={cat.icon}
                            color={cat.color || '#14b8a6'}
                            onPress={() => navigation.navigate('Services', { categoryId: cat.id })}
                        />
                    ))}
                    {categories.length === 0 && (
                        ['Plumbing', 'Electric', 'Cleaning', 'Painting', 'Carpentry', 'AC Repair'].map((name, i) => (
                            <ServiceCategory key={i} title={name} icon={null} color="#14b8a6" />
                        ))
                    )}
                </View>

                <View style={styles.recentBookings}>
                    <Text style={styles.sectionTitle}>My Active Bookings</Text>
                    {bookings.length > 0 ? (
                        bookings.slice(0, 3).map((booking) => {
                            const status = getStatusStyle(booking.status);
                            return (
                                <TouchableOpacity
                                    key={booking.id}
                                    style={styles.bookingCard}
                                    onPress={() => navigation.navigate('Details', { bookingId: booking.id })}
                                >
                                    <View style={styles.bookingHeader}>
                                        <Text style={styles.bookingService}>{booking.service_name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                            <Text style={[styles.statusText, { color: status.text }]}>
                                                {booking.status?.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.bookingDate}>
                                        📅 {new Date(booking.job_date).toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.bookingProvider}>
                                        👤 {booking.provider_name || 'Finding Provider...'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyBookings}>
                            <Text style={styles.emptyText}>You have no active bookings.</Text>
                            <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('Services')}>
                                <Text style={styles.bookNowText}>Book a Service</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loaderText: {
        marginTop: verticalScale(12),
        fontSize: moderateScale(14),
        color: '#64748b',
    },
    header: {
        paddingHorizontal: moderateScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: moderateScale(16),
        color: '#64748b',
    },
    nameText: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatar: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    searchBar: {
        marginHorizontal: moderateScale(20),
        marginVertical: verticalScale(20),
        backgroundColor: '#f1f5f9',
        padding: moderateScale(15),
        borderRadius: moderateScale(15),
    },
    searchPlaceholder: {
        color: '#94a3b8',
        fontSize: moderateScale(16),
    },
    promoCard: {
        marginHorizontal: moderateScale(20),
        backgroundColor: '#115e59',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        color: '#fff',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    promoSubtitle: {
        color: '#ccfbf1',
        fontSize: moderateScale(14),
        marginTop: verticalScale(4),
        marginBottom: verticalScale(16),
    },
    promoButton: {
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(12),
        alignSelf: 'flex-start',
    },
    promoButtonText: {
        color: '#115e59',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    promoExtra: {
        fontSize: moderateScale(60),
    },
    sectionHeader: {
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    viewAllText: {
        color: '#14b8a6',
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: moderateScale(10),
        marginBottom: verticalScale(20),
    },
    categoryItem: {
        width: (SCREEN_WIDTH - moderateScale(20)) / 3,
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    categoryIcon: {
        width: moderateScale(65),
        height: moderateScale(65),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    categoryTitle: {
        fontSize: moderateScale(13),
        fontWeight: '500',
        color: '#475569',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    recentBookings: {
        paddingHorizontal: moderateScale(20),
        marginBottom: verticalScale(30),
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(16),
        marginTop: verticalScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    bookingService: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statusBadge: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    bookingDate: {
        fontSize: moderateScale(13),
        color: '#64748b',
        marginBottom: verticalScale(4),
    },
    bookingProvider: {
        fontSize: moderateScale(13),
        color: '#64748b',
    },
    emptyBookings: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(20),
        padding: moderateScale(30),
        alignItems: 'center',
        marginTop: verticalScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: moderateScale(16),
        marginBottom: verticalScale(16),
    },
    bookNowButton: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: moderateScale(24),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
    },
    bookNowText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default CustomerDashboard;
