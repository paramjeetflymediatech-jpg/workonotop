import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Linking,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';

const InvoicesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInvoices = async () => {
        try {
            const res = await apiService.customer.getInvoices(user.id);
            if (res.success) {
                setInvoices(res.data);
            }
        } catch (error) {
            console.error('Fetch invoices error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInvoices();
    };

    const handleDownload = (bookingId) => {
        const url = `${API_BASE_URL}/api/bookings/${bookingId}/invoice/download`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const renderInvoiceItem = ({ item }) => (
        <View style={styles.invoiceCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
                    <Text style={styles.serviceName}>{item.service_name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? '#f0fdf4' : '#fff7ed' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'paid' ? '#166534' : '#9a3412' }]}>
                        {item.status?.toUpperCase()}
                    </Text>
                </ View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.dateLabel}>Date</Text>
                    <Text style={styles.dateValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>${parseFloat(item.total_amount).toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.downloadBtn} 
                onPress={() => handleDownload(item.booking_id)}
            >
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Invoices</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            ) : (
                <FlatList
                    data={invoices}
                    renderItem={renderInvoiceItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No invoices found yet.</Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(16),
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(16),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: moderateScale(16), paddingBottom: 100 },
    invoiceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    invoiceNumber: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
    serviceName: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dateLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' },
    dateValue: { fontSize: 14, fontWeight: '600', color: '#334155' },
    amountContainer: { alignItems: 'flex-end' },
    amountLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' },
    amountValue: { fontSize: 18, fontWeight: 'bold', color: PRIMARY },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#64748b' },
});

export default InvoicesScreen;
