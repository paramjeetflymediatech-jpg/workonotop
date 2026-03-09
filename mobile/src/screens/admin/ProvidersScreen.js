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
    Alert,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const ProvidersScreen = ({ navigation }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const statuses = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'pending', label: 'Pending' },
        { id: 'rejected', label: 'Rejected' },
    ];

    const fetchProviders = async () => {
        try {
            const res = await api.get('/api/admin/providers', { status: statusFilter !== 'all' ? statusFilter : undefined });
            if (res.success) {
                setProviders(res.data.providers || []);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [statusFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviders();
    };

    const handleAction = (providerId, action) => {
        const title = action === 'approve' ? 'Approve Provider' : 'Reject Provider';
        const message = `Are you sure you want to ${action} this provider?`;

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: action.toUpperCase(),
                style: action === 'reject' ? 'destructive' : 'default',
                onPress: async () => {
                    try {
                        const res = await api.put('/api/admin/providers', {
                            providerId,
                            action,
                            rejectionReason: action === 'reject' ? 'Does not meet requirements' : undefined
                        });
                        if (res.success) {
                            Alert.alert('Success', `Provider ${action}ed successfully`);
                            fetchProviders();
                        }
                    } catch (error) {
                        Alert.alert('Error', error.message);
                    }
                }
            }
        ]);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return { bg: '#dcfce7', text: '#16a34a' };
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'inactive': return { bg: '#f1f5f9', text: '#64748b' };
            case 'rejected': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const renderProviderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.providerAvatar}>
                        <Text style={styles.avatarText}>{item.name?.[0]}</Text>
                    </View>
                    <View style={styles.providerMeta}>
                        <Text style={styles.providerName}>{item.name}</Text>
                        <Text style={styles.providerEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Docs</Text>
                        <Text style={styles.statVal}>{item.approved_docs}/{item.documents_count}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Rating</Text>
                        <Text style={styles.statVal}>{parseFloat(item.avg_rating || 0).toFixed(1)} ⭐</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Jobs</Text>
                        <Text style={styles.statVal}>{item.total_reviews || 0}</Text>
                    </View>
                </View>

                {item.status === 'pending' || (item.status === 'inactive' && item.onboarding_completed === 1) ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleAction(item.id, 'approve')}
                        >
                            <Ionicons name="checkmark-circle-outline" size={moderateScale(18)} color="#fff" />
                            <Text style={styles.actionBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleAction(item.id, 'reject')}
                        >
                            <Ionicons name="close-circle-outline" size={moderateScale(18)} color="#fff" />
                            <Text style={styles.actionBtnText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.viewProfileBtn}>
                        <Text style={styles.viewProfileText}>View Full Profile</Text>
                        <Ionicons name="chevron-forward" size={moderateScale(16)} color="#64748b" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Providers</Text>
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
                    data={providers}
                    renderItem={renderProviderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="construct-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No providers found</Text>
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
    filterList: { paddingHorizontal: scale(20) },
    filterItem: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        marginRight: scale(10),
        backgroundColor: '#f1f5f9',
    },
    activeFilterItem: { backgroundColor: '#115e59' },
    filterLabel: { fontSize: moderateScale(14), color: '#64748b', fontWeight: '600' },
    activeFilterLabel: { color: '#fff' },
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
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    providerAvatar: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(12),
        backgroundColor: '#115e5910',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#115e59' },
    providerMeta: { flex: 1, marginLeft: scale(12) },
    providerName: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    providerEmail: { fontSize: moderateScale(12), color: '#64748b' },
    statusBadge: {
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(6),
    },
    statusText: { fontSize: moderateScale(10), fontWeight: 'bold', textTransform: 'uppercase' },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(15),
    },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: moderateScale(10), color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
    statVal: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#0f172a', marginTop: verticalScale(2) },
    statDivider: { width: 1, height: '100%', backgroundColor: '#e2e8f0' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        height: verticalScale(40),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveBtn: { backgroundColor: '#115e59', marginRight: scale(8) },
    rejectBtn: { backgroundColor: '#ef4444', marginLeft: scale(8) },
    actionBtnText: { color: '#fff', fontSize: moderateScale(14), fontWeight: 'bold', marginLeft: scale(6) },
    viewProfileBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    viewProfileText: { fontSize: moderateScale(14), color: '#64748b', fontWeight: '600', marginRight: scale(4) },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(100) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(20) },
});

export default ProvidersScreen;
