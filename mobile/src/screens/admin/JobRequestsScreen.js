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
    ScrollView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const JobRequestsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const statuses = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'matching', label: 'Matching' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'awaiting_approval', label: 'Awaiting' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'disputed', label: 'Disputed' },
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
            case 'pending': return { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', ring: '#fde68a' }; // Amber
            case 'matching': return { bg: '#fff7ed', text: '#c2410c', dot: '#f97316', ring: '#fed7aa' }; // Orange
            case 'confirmed': return { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', ring: '#bfdbfe' }; // Blue
            case 'in_progress': return { bg: '#f5f3ff', text: '#6d28d9', dot: '#8b5cf6', ring: '#ddd6fe' }; // Violet
            case 'awaiting_approval': return { bg: '#fefce8', text: '#a16207', dot: '#eab308', ring: '#fef08a' }; // Yellow
            case 'completed': return { bg: '#ecfdf5', text: '#047857', dot: '#10b981', ring: '#a7f3d0' }; // Emerald
            case 'cancelled': 
            case 'disputed': return { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', ring: '#fecaca' }; // Red
            default: return { bg: '#f8fafc', text: '#475569', dot: '#94a3b8', ring: '#e2e8f0' }; // Gray
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const openBookingDetails = (booking) => {
        navigation.navigate('AdminJobDetails', { booking });
    };

    const filteredBookings = statusFilter === 'all'
        ? (bookings || [])
        : (bookings || []).filter(b => b.status === statusFilter);

    const renderBookingItem = ({ item }) => {
        const style = getStatusStyle(item.status);
        const amount = parseFloat(item.service_price || 0);
        const overtime = parseFloat(item.additional_price || 0);
        const commissionNeeded = item.commission_percent === null && item.status === 'pending';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openBookingDetails(item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                        <View style={styles.idBadge}>
                            <Text style={styles.bookingNumber}>#{item.booking_number || item.id}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.ring }]}>
                            <View style={[styles.statusDot, { backgroundColor: style.dot }]} />
                            <Text style={[styles.statusText, { color: style.text }]}>
                                {item.status ? item.status.replace('_', ' ').toUpperCase() : 'N/A'}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={styles.serviceName}>{item.service_name || 'Service'}</Text>
                    
                    {commissionNeeded && (
                        <View style={styles.warningBadge}>
                            <Ionicons name="alert-circle" size={14} color="#dc2626" />
                            <Text style={styles.warningText}>Commission Needed</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.contentRow}>
                        <View style={styles.contentItem}>
                            <Text style={styles.contentLabel}>CUSTOMER</Text>
                            <Text style={styles.contentText} numberOfLines={1}>
                                {item.customer_first_name} {item.customer_last_name}
                            </Text>
                        </View>
                        <View style={styles.contentItem}>
                            <Text style={styles.contentLabel}>DATE</Text>
                            <Text style={styles.contentText}>
                                {item.job_date ? new Date(item.job_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.contentItem}>
                            <Text style={styles.contentLabel}>DURATION</Text>
                            <Text style={styles.contentText}>{item.service_duration || 60}m</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={12} color="#64748b" />
                        <Text style={styles.locationText} numberOfLines={1}>{item.address_line1}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceLabel}>RATE</Text>
                        <Text style={styles.amountText}>
                            {formatCurrency(amount)}
                            <Text style={styles.perUnit}> /hr</Text>
                        </Text>
                        {overtime > 0 && (
                            <Text style={styles.overtimeText}>+{formatCurrency(overtime)}/hr OT</Text>
                        )}
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.priceLabel}>PROVIDER</Text>
                        {item.provider_name ? (
                            <View style={styles.providerBadge}>
                                <View style={styles.providerDot} />
                                <Text style={styles.providerName} numberOfLines={1}>{item.provider_name}</Text>
                            </View>
                        ) : (
                            <Text style={styles.unassignedLabel}>Unassigned</Text>
                        )}
                    </View>
                </View>

                {item.commission_percent !== null ? (
                    <View style={styles.commissionBanner}>
                        <View style={[styles.commissionDot, { backgroundColor: '#10b981' }]} />
                        <Text style={styles.commissionBannerText}>
                            Commission {item.commission_percent}% — provider gets {formatCurrency(item.provider_amount || (amount * (1 - item.commission_percent / 100)))}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.commissionBanner}>
                        <View style={[styles.commissionDot, { backgroundColor: '#f59e0b' }]} />
                        <Text style={styles.commissionBannerText}>Commission not set</Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.viewDetailsBtn}
                    onPress={() => openBookingDetails(item)}
                >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>

                <View style={[styles.topLine, { backgroundColor: style.dot }]} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <View style={styles.headerTitleWrapper}>
                    <Text style={styles.headerTitle}>Job Requests</Text>
                    <Text style={styles.headerSubtitle}>{bookings.length} overall</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={moderateScale(22)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                >
                    {statuses.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.filterItem,
                                statusFilter === item.id && styles.activeFilterItem
                            ]}
                            onPress={() => setStatusFilter(item.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterLabel,
                                statusFilter === item.id && styles.activeFilterLabel
                            ]}>
                                {item.label}
                            </Text>
                            <View style={[
                                styles.filterCountBadge,
                                statusFilter === item.id ? styles.activeCountBadge : styles.inactiveCountBadge
                            ]}>
                                <Text style={[
                                    styles.filterCountText,
                                    statusFilter === item.id && styles.activeCountText
                                ]}>
                                    {bookings.filter(j => item.id === 'all' ? true : j.status === item.id).length}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.loaderText}>Loading jobs...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#0d9488" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="clipboard-outline" size={scale(40)} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyTitle}>No Jobs Found</Text>
                            <Text style={styles.emptySub}>There are no bookings in this category.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        height: verticalScale(70),
    },
    headerTitleWrapper: {
        alignItems: 'center',
    },
    headerTitle: { 
        fontSize: moderateScale(18), 
        fontWeight: '800', 
        color: '#1e293b',
        letterSpacing: -0.5
    },
    headerSubtitle: {
        fontSize: moderateScale(11),
        color: '#64748b',
        fontWeight: '600',
    },
    menuBtn: { padding: scale(4) },
    refreshBtn: { padding: scale(4) },
    
    filterWrapper: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filterList: {
        paddingHorizontal: scale(16),
        gap: scale(8),
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(12),
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterItem: {
        backgroundColor: '#0d9488',
        borderColor: '#0d9488',
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    filterLabel: {
        fontSize: moderateScale(13),
        color: '#475569',
        fontWeight: '700',
    },
    activeFilterLabel: {
        color: '#fff',
    },
    filterCountBadge: {
        marginLeft: scale(6),
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(1),
        borderRadius: moderateScale(6),
    },
    inactiveCountBadge: {
        backgroundColor: '#e2e8f0',
    },
    activeCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filterCountText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
        color: '#64748b',
    },
    activeCountText: {
        color: '#fff',
    },

    listContent: { 
        padding: scale(16),
        paddingBottom: verticalScale(30)
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: scale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    topLine: {
        position: 'absolute',
        top: 0,
        left: scale(20),
        right: scale(20),
        height: 2,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        opacity: 0.6
    },
    cardHeader: {
        marginBottom: verticalScale(12),
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    idBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
    },
    bookingNumber: {
        fontSize: moderateScale(11),
        color: '#0d9488',
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: scale(6),
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    serviceName: {
        fontSize: moderateScale(17),
        fontWeight: '800',
        color: '#0f172a',
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff1f2',
        alignSelf: 'flex-start',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(8),
        marginTop: verticalScale(8),
    },
    warningText: {
        fontSize: moderateScale(10),
        color: '#e11d48',
        fontWeight: '700',
        marginLeft: scale(4),
    },
    
    cardContent: {
        marginBottom: verticalScale(16),
        gap: verticalScale(12),
    },
    contentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(16),
        padding: scale(12),
    },
    contentItem: {
        flex: 1,
    },
    contentLabel: {
        fontSize: moderateScale(9),
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 0.5,
        marginBottom: verticalScale(2),
    },
    contentText: {
        fontSize: moderateScale(12),
        color: '#334155',
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(4),
    },
    locationText: {
        fontSize: moderateScale(11),
        color: '#64748b',
        fontWeight: '500',
        marginLeft: scale(6),
    },
    
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(16),
    },
    priceLabel: {
        fontSize: moderateScale(9),
        color: '#94a3b8',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: verticalScale(4),
    },
    amountText: {
        fontSize: moderateScale(18),
        fontWeight: '900',
        color: '#0d9488',
    },
    perUnit: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: '400',
    },
    overtimeText: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: '600',
        marginTop: verticalScale(2),
    },
    providerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(10),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    providerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: scale(6),
    },
    providerName: {
        fontSize: moderateScale(12),
        color: '#1e293b',
        fontWeight: '700',
    },
    unassignedLabel: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        fontStyle: 'italic',
        fontWeight: '600',
    },

    commissionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: scale(10),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(16),
    },
    commissionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: scale(8),
    },
    commissionBannerText: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: '600',
        flex: 1,
    },

    viewDetailsBtn: {
        backgroundColor: '#0d9488',
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    viewDetailsText: {
        color: '#fff',
        fontSize: moderateScale(12),
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    loaderText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
    
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(80),
        paddingHorizontal: scale(40),
    },
    emptyIconCircle: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(20),
    },
    emptyTitle: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: '#334155',
        marginBottom: verticalScale(8),
    },
    emptySub: {
        fontSize: moderateScale(14),
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default JobRequestsScreen;
