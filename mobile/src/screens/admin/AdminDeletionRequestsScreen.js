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
    TextInput,
    Modal,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const AdminDeletionRequestsScreen = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchRequests = async (pageNum = 1, shouldRefresh = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const res = await api.get(`/api/admin/deletion-requests?page=${pageNum}&limit=10`);
            if (res.success) {
                if (shouldRefresh || pageNum === 1) {
                    setRequests(res.data);
                } else {
                    setRequests(prev => [...prev, ...res.data]);
                }
                setTotalPages(res.pagination.totalPages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching deletion requests:', error);
            Alert.alert('Error', 'Failed to fetch deletion requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests(1, true);
    };

    const handleLoadMore = () => {
        if (page < totalPages && !loadingMore) {
            fetchRequests(page + 1);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        Alert.alert(
            `${status.charAt(0).toUpperCase() + status.slice(1)} Request`,
            `Are you sure you want to mark this request as ${status}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            const res = await api.patch('/api/admin/deletion-requests', { id, status });
                            if (res.success) {
                                Alert.alert('Success', res.message);
                                setModalVisible(false);
                                fetchRequests(1, true);
                            } else {
                                Alert.alert('Error', res.message || 'Update failed');
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Update failed');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const filteredRequests = requests.filter(req =>
        req.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#eab308';
            case 'processed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    const renderRequestItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                setSelectedRequest(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            
            <View style={styles.cardBody}>
                <Text style={styles.emailText}>{item.email}</Text>
                {item.reason && (
                    <Text style={styles.reasonText} numberOfLines={2}>
                        {item.reason}
                    </Text>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                <Text style={styles.viewDetailsText}>View Details</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Deletion Requests</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={moderateScale(20)} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by email or reason..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={moderateScale(20)} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="trash-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No deletion requests found</Text>
                        </View>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator style={{ marginVertical: 20 }} color="#115e59" />
                        ) : null
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Request Details</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={moderateScale(24)} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        {selectedRequest && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: verticalScale(20) }}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>REGISTERED EMAIL</Text>
                                    <Text style={styles.detailValue}>{selectedRequest.email}</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>STATUS</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) + '20', alignSelf: 'flex-start', marginTop: 4 }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>
                                            {selectedRequest.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>SUBMISSION DATE</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedRequest.created_at).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>REASON FOR DELETION</Text>
                                    <View style={styles.reasonBox}>
                                        <Text style={styles.reasonFullText}>
                                            {selectedRequest.reason || 'No reason provided.'}
                                        </Text>
                                    </View>
                                </View>

                                {selectedRequest.status === 'pending' && (
                                    <View style={styles.modalActionRow}>
                                        <TouchableOpacity
                                            style={[styles.modalActionBtn, styles.processBtn]}
                                            onPress={() => handleUpdateStatus(selectedRequest.id, 'processed')}
                                            disabled={updating}
                                        >
                                            {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Process Deletion</Text>}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalActionBtn, styles.cancelBtnInner]}
                                            onPress={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                                            disabled={updating}
                                        >
                                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Cancel Request</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    searchContainer: {
        padding: scale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(12),
        height: verticalScale(45),
    },
    searchInput: {
        flex: 1,
        marginLeft: scale(10),
        fontSize: moderateScale(15),
        color: '#0f172a',
    },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: scale(20) },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    statusBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
    },
    cardBody: {
        marginBottom: verticalScale(12),
    },
    emailText: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(4),
    },
    reasonText: {
        fontSize: moderateScale(13),
        color: '#64748b',
        lineHeight: moderateScale(18),
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: verticalScale(12),
    },
    viewDetailsText: {
        fontSize: moderateScale(13),
        color: '#115e59',
        fontWeight: '600',
        marginLeft: scale(4),
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(20),
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        padding: scale(5),
    },
    detailItem: {
        marginBottom: verticalScale(20),
    },
    detailLabel: {
        fontSize: moderateScale(11),
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: verticalScale(6),
    },
    detailValue: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#0f172a',
    },
    reasonBox: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        padding: scale(15),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: verticalScale(4),
    },
    reasonFullText: {
        fontSize: moderateScale(14),
        color: '#334155',
        lineHeight: moderateScale(22),
    },
    modalActionRow: {
        flexDirection: 'column',
        gap: verticalScale(12),
        marginTop: verticalScale(10),
    },
    modalActionBtn: {
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    processBtn: {
        backgroundColor: '#115e59',
    },
    cancelBtnInner: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});

export default AdminDeletionRequestsScreen;
