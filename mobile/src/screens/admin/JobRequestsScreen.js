import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Modal,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const JobRequestsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const statuses = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/bookings');
            if (res.success) {
                setBookings(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea' };
            case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const openBookingDetails = (booking) => {
        navigation.navigate('AdminJobDetails', { booking });
    };

    const filteredBookings = statusFilter === 'all'
        ? bookings
        : bookings.filter(b => b.status === statusFilter);

    const renderBookingItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const amount = parseFloat(item.service_price || 0) + parseFloat(item.additional_price || 0);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openBookingDetails(item)}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.bookingNumber}>#{item.booking_number || item.id}</Text>
                        <Text style={styles.serviceName}>{item.service_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status?.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={moderateScale(16)} color="#64748b" />
                        <Text style={styles.infoText}>{item.customer_first_name} {item.customer_last_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={moderateScale(16)} color="#64748b" />
                        <Text style={styles.infoText}>{new Date(item.job_date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={moderateScale(16)} color="#64748b" />
                        <Text style={styles.infoText} numberOfLines={1}>{item.address_line1}, {item.city}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => openBookingDetails(item)}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={moderateScale(14)} color="#115e59" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Requests</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    data={statuses}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterItem,
                                statusFilter === item.id && styles.activeFilterItem
                            ]}
                            onPress={() => setStatusFilter(item.id)}
                        >
                            <Text style={[
                                styles.filterLabel,
                                statusFilter === item.id && styles.activeFilterLabel
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No bookings found</Text>
                        </View>
                    }
                />
            )}


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginTop: verticalScale(25),

    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    filterContainer: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filterList: {
        paddingHorizontal: scale(20),
    },
    filterItem: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        marginRight: scale(10),
        backgroundColor: '#f1f5f9',
    },
    activeFilterItem: {
        backgroundColor: '#115e59',
    },
    filterLabel: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '600',
    },
    activeFilterLabel: {
        color: '#fff',
    },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: scale(20) },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    bookingNumber: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    serviceName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: verticalScale(2),
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
    cardContent: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(12),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    infoText: {
        fontSize: moderateScale(13),
        color: '#475569',
        marginLeft: scale(8),
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#115e59',
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailsBtnText: {
        fontSize: moderateScale(14),
        color: '#115e59',
        fontWeight: '700',
        marginRight: scale(4),
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(100),
    },
    emptyText: {
        fontSize: moderateScale(16),
        color: '#94a3b8',
        marginTop: verticalScale(20),
    },
});

export default JobRequestsScreen;
