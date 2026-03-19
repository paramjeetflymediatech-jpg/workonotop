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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEarnings = async () => {
        try {
            const res = await api.get('/api/admin/earnings');
            if (res.success) {
                setEarningsData(res.data);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEarnings();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
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
                <Text style={styles.headerTitle}>Earnings</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
                    <SummaryCard title="Total Volume" amount={earningsData?.summary?.totalRevenue || 0} icon="stats-chart-outline" color="#3b82f6" />
                    <SummaryCard title="Platform Commission" amount={earningsData?.summary?.totalCommission || 0} icon="pie-chart-outline" color="#10b981" />
                    <SummaryCard title="Payouts" amount={earningsData?.summary?.totalPayouts || 0} icon="time-outline" color="#f59e0b" />
                </ScrollView>
            </View>

            <View style={styles.transactionsSection}>
                <Text style={styles.sectionTitle}>Recent Invoices</Text>
                <FlatList
                    data={earningsData?.invoices || []}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No transactions found</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
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
    transactionsSection: { flex: 1, padding: scale(20) },
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
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(50) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(15) },
});

export default EarningsScreen;
