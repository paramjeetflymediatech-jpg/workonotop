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
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const EarningsScreen = ({ navigation }) => {
    const [earningsData, setEarningsData] = useState(null);
    const [payoutsData, setPayoutsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payouts'

    const fetchData = async () => {
        try {
            const [earningsRes, payoutsRes] = await Promise.all([
                api.get('/api/admin/earnings'),
                api.get('/api/admin/payouts')
            ]);

            if (earningsRes.success) {
                setEarningsData(earningsRes.data);
            }
            if (payoutsRes.success) {
                setPayoutsData(payoutsRes.data);
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const SummaryCard = ({ title, amount, icon, color }) => (
        <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={moderateScale(22)} color={color} />
            </View>
            <Text style={styles.summaryAmount}>{formatCurrency(amount)}</Text>
            <Text style={styles.summaryTitle}>{title}</Text>
        </View>
    );

    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Ionicons
                    name="receipt-outline"
                    size={moderateScale(24)}
                    color="#115e59"
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.service_name || 'Service Job'}</Text>
                <Text style={styles.transactionDate}>
                    {item.invoice_number} • {new Date(item.completion_date || item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.transactionAmount, { color: '#0f172a' }]}>
                    {formatCurrency(item.total_amount)}
                </Text>
                <Text style={{ fontSize: 10, color: '#10b981', fontWeight: 'bold' }}>
                    Comm: {formatCurrency(item.commission_amount || 0)}
                </Text>
            </View>
        </View>
    );

    const renderPayoutItem = ({ item }) => (
        <View style={styles.payoutItem}>
            <View style={styles.payoutStatusContainer}>
                <View style={[styles.statusBadge, { 
                    backgroundColor: item.status === 'paid' ? '#10b98120' : '#f59e0b20' 
                }]}>
                    <Text style={[styles.statusText, { 
                        color: item.status === 'paid' ? '#10b981' : '#f59e0b' 
                    }]}>{item.status?.toUpperCase()}</Text>
                </View>
                <Text style={styles.payoutDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.payoutDetails}>
                <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{item.provider_name}</Text>
                    <Text style={styles.bookingRef}>{item.booking_number ? `Booking #${item.booking_number}` : 'Manual Payout'}</Text>
                </View>
                <Text style={styles.payoutAmount}>{formatCurrency(item.amount)}</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#115e59" />
                <Text style={styles.loaderText}>Fetching Financials...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Financials</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'invoices' && styles.activeTab]} 
                    onPress={() => setActiveTab('invoices')}
                >
                    <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>Invoices</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'payouts' && styles.activeTab]} 
                    onPress={() => setActiveTab('payouts')}
                >
                    <Text style={[styles.tabText, activeTab === 'payouts' && styles.activeTabText]}>Payouts</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
                    {activeTab === 'invoices' ? (
                        <>
                            <SummaryCard title="Total Volume" amount={earningsData?.summary?.totalRevenue || 0} icon="stats-chart-outline" color="#3b82f6" />
                            <SummaryCard title="Platform Commission" amount={earningsData?.summary?.totalCommission || 0} icon="pie-chart-outline" color="#10b981" />
                            <SummaryCard title="Bookings" amount={earningsData?.summary?.totalBookings || 0} icon="calendar-outline" color="#6366f1" />
                        </>
                    ) : (
                        <>
                            <SummaryCard title="Total Paid" amount={payoutsData?.summary?.total_paid_amount || 0} icon="checkmark-circle-outline" color="#10b981" />
                            <SummaryCard title="Pending" amount={payoutsData?.summary?.total_pending_amount || 0} icon="time-outline" color="#f59e0b" />
                            <SummaryCard title="Total Payouts" amount={payoutsData?.summary?.total_payouts || 0} icon="layers-outline" color="#3b82f6" />
                        </>
                    )}
                </ScrollView>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>
                    {activeTab === 'invoices' ? 'Recent Invoices' : 'Payout History'}
                </Text>
                <FlatList
                    data={activeTab === 'invoices' ? (earningsData?.invoices || []) : (payoutsData?.payouts || [])}
                    renderItem={activeTab === 'invoices' ? renderTransactionItem : renderPayoutItem}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons 
                                name={activeTab === 'invoices' ? "wallet-outline" : "cash-outline"} 
                                size={scale(60)} 
                                color="#e2e8f0" 
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === 'invoices' ? 'No invoices found' : 'No payout history found'}
                            </Text>
                        </View>
                    }
                />
            </View>
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
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tab: {
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        marginRight: scale(10),
        backgroundColor: '#f1f5f9',
    },
    activeTab: {
        backgroundColor: '#115e59',
    },
    tabText: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
        color: '#64748b',
    },
    activeTabText: {
        color: '#fff',
    },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: verticalScale(10), color: '#64748b', fontWeight: 'bold' },
    summaryContainer: { paddingVertical: verticalScale(20), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    summaryScroll: { paddingHorizontal: scale(20) },
    summaryCard: {
        width: scale(160),
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(15),
        marginRight: scale(15),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconBox: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(10), justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(10) },
    summaryAmount: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    summaryTitle: { fontSize: moderateScale(11), color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: verticalScale(4) },
    listSection: { flex: 1, padding: scale(20) },
    sectionTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(15) },
    listContent: { paddingBottom: verticalScale(20) },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: scale(15),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    transactionIcon: { marginRight: scale(12) },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#0f172a' },
    transactionDate: { fontSize: moderateScale(12), color: '#94a3b8', marginTop: verticalScale(2) },
    transactionAmount: { fontSize: moderateScale(15), fontWeight: 'bold' },
    payoutItem: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: scale(15),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    payoutStatusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10)
    },
    statusBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(6),
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: 'bold',
    },
    payoutDate: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
    },
    payoutDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    bookingRef: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginTop: 2,
    },
    payoutAmount: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#115e59',
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(50) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(15) },
});

export default EarningsScreen;
