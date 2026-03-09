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
    RefreshControl,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const CustomerDashboard = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
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
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.bookingHeader}>
                                        <Text style={styles.bookingService}>{booking.service_name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                            <Text style={[styles.statusText, { color: status.text }]}>
                                                {booking.status?.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.bookingFooter}>
                                        <Text style={styles.bookingDate}>
                                            📅 {new Date(booking.job_date).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.bookingProvider}>
                                            👤 {booking.provider_name || 'Finding Pro...'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyBookings}>
                            <Text style={styles.emptyText}>You have no active bookings yet.</Text>
                            <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('Services')}>
                                <Text style={styles.bookNowText}>Book a Service</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Bottom Space to prevent overlap with floating tab bar */}
                <View style={{ height: verticalScale(100) + insets.bottom }} />
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
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    nameText: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatar: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: '#115e59',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    avatarText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    searchBar: {
        marginHorizontal: moderateScale(20),
        marginVertical: verticalScale(15),
        backgroundColor: '#f8fafc',
        padding: moderateScale(14),
        borderRadius: moderateScale(14),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchPlaceholder: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
    },
    promoCard: {
        marginHorizontal: moderateScale(20),
        backgroundColor: '#115e59',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(25),
        elevation: 8,
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        color: '#fff',
        fontSize: moderateScale(22),
        fontWeight: 'bold',
    },
    promoSubtitle: {
        color: '#ccfbf1',
        fontSize: moderateScale(13),
        marginTop: verticalScale(4),
        marginBottom: verticalScale(12),
        lineHeight: moderateScale(18),
    },
    promoButton: {
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(10),
        alignSelf: 'flex-start',
    },
    promoButtonText: {
        color: '#115e59',
        fontWeight: 'bold',
        fontSize: moderateScale(13),
    },
    promoExtra: {
        fontSize: moderateScale(50),
        marginLeft: scale(10),
    },
    sectionHeader: {
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    viewAllText: {
        color: '#115e59',
        fontWeight: '600',
        fontSize: moderateScale(13),
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: moderateScale(15),
        marginBottom: verticalScale(15),
    },
    categoryItem: {
        width: (SCREEN_WIDTH - moderateScale(30)) / 3,
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    categoryIcon: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(6),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    categoryTitle: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
    },
    recentBookings: {
        paddingHorizontal: moderateScale(20),
        marginBottom: verticalScale(20),
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        marginTop: verticalScale(10),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
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
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    bookingDate: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginBottom: verticalScale(4),
    },
    bookingProvider: {
        fontSize: moderateScale(12),
        color: '#64748b',
    },
    emptyBookings: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(16),
        padding: moderateScale(24),
        alignItems: 'center',
        marginTop: verticalScale(10),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
        marginBottom: verticalScale(12),
    },
    bookNowButton: {
        backgroundColor: '#115e59',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
    },
    bookNowText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    }
});

export default CustomerDashboard;
