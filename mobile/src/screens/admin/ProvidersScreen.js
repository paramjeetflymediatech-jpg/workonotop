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
    Image,
    Modal,
    ScrollView,
    Platform,
    Dimensions,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';
import { API_BASE_URL } from '../../config';

const ProvidersScreen = ({ navigation }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [providerDocs, setProviderDocs] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);

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

    const fetchDocuments = async (providerId) => {
        setLoadingDocs(true);
        try {
            const res = await api.get(`/api/admin/providers/${providerId}/documents`);
            if (res.success) {
                setProviderDocs(res.documents || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [statusFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviders();
    };

    const handleAction = (providerId, action, reason) => {
        const title = action === 'approve' ? 'Approve Provider' : 'Reject Provider';
        const message = reason 
            ? `Are you sure you want to reject this provider for: "${reason}"?`
            : `Are you sure you want to ${action} this provider?`;

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
                            rejectionReason: action === 'reject' ? (reason || 'Does not meet requirements') : undefined
                        });
                        if (res.success) {
                            Alert.alert('Success', `Provider ${action}ed successfully`);
                            setModalVisible(false);
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

    const openProviderDetails = (provider) => {
        setSelectedProvider(provider);
        setProviderDocs([]);
        setShowRejectInput(false);
        setRejectionReason('');
        setModalVisible(true);
        fetchDocuments(provider.id);
    };

    const renderProviderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openProviderDetails(item)}
            >
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

                {(item.status === 'pending' || (item.status === 'inactive' && item.onboarding_completed === 1)) && (
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
                )}

                <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() => openProviderDetails(item)}
                >
                    <Text style={styles.viewProfileText}>View Full Profile</Text>
                    <Ionicons name="chevron-forward" size={moderateScale(16)} color="#64748b" />
                </TouchableOpacity>
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Provider Details</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={moderateScale(24)} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        {selectedProvider && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalProfileHeader}>
                                    <View style={styles.largeAvatar}>
                                        <Text style={styles.largeAvatarText}>
                                            {selectedProvider.name?.[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.modalUserName}>
                                        {selectedProvider.name}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(selectedProvider.status).bg, marginTop: verticalScale(10) }]}>
                                        <Text style={[styles.statusText, { color: getStatusStyle(selectedProvider.status).text }]}>
                                            {selectedProvider.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Contact Information</Text>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="mail-outline" size={moderateScale(20)} color="#115e59" />
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailLabel}>Email Address</Text>
                                            <Text style={styles.detailValue}>{selectedProvider.email}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="call-outline" size={moderateScale(20)} color="#115e59" />
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailLabel}>Phone Number</Text>
                                            <Text style={styles.detailValue}>{selectedProvider.phone || 'Not provided'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Performance & Stats</Text>
                                    <View style={styles.statsRowModal}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statNumber}>{parseFloat(selectedProvider.avg_rating || 0).toFixed(1)}</Text>
                                            <Text style={styles.statLabel}>Rating ⭐</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statNumber}>{selectedProvider.total_reviews || 0}</Text>
                                            <Text style={styles.statLabel}>Total Jobs</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statNumber}>{selectedProvider.approved_docs || 0}</Text>
                                            <Text style={styles.statLabel}>Docs ✅</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                                    {loadingDocs ? (
                                        <ActivityIndicator size="small" color="#115e59" style={{ marginVertical: 20 }} />
                                    ) : providerDocs.length > 0 ? (
                                        <View style={styles.docsGallery}>
                                            {providerDocs.map((doc, index) => (
                                                <TouchableOpacity 
                                                    key={doc.id || index} 
                                                    style={styles.docItem}
                                                    onPress={() => {
                                                        const url = doc.document_url.startsWith('http') 
                                                            ? doc.document_url 
                                                            : `${API_BASE_URL}${doc.document_url}`;
                                                        setViewerImage(url);
                                                        setViewerVisible(true);
                                                    }}
                                                >
                                                    <View style={styles.docImageContainer}>
                                                        <Image 
                                                            source={{ uri: doc.document_url.startsWith('http') ? doc.document_url : `${API_BASE_URL}${doc.document_url}` }} 
                                                            style={styles.docImage}
                                                            resizeMode="cover"
                                                        />
                                                        <View style={[styles.docStatusBadge, { backgroundColor: getStatusStyle(doc.status).bg }]}>
                                                            <Text style={[styles.docStatusText, { color: getStatusStyle(doc.status).text }]}>
                                                                {doc.status}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.docLabelText}>{doc.document_type.replace('_', ' ')}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.emptyDocs}>
                                            <Ionicons name="document-text-outline" size={moderateScale(32)} color="#cbd5e1" />
                                            <Text style={styles.emptyDocsText}>No documents uploaded yet</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Business Info</Text>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="business-outline" size={moderateScale(20)} color="#115e59" />
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailLabel}>Account Type</Text>
                                            <Text style={styles.detailValue}>Service Provider</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="calendar-outline" size={moderateScale(20)} color="#115e59" />
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailLabel}>Provider Since</Text>
                                            <Text style={styles.detailValue}>
                                                {new Date(selectedProvider.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {selectedProvider.status === 'pending' && (
                                    <View style={{ marginTop: verticalScale(10) }}>
                                        {!showRejectInput ? (
                                            <View style={styles.modalActionRow}>
                                                <TouchableOpacity
                                                    style={[styles.modalActionBtn, styles.approveBtn]}
                                                    onPress={() => handleAction(selectedProvider.id, 'approve')}
                                                >
                                                    <Text style={styles.actionBtnText}>Approve Provider</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.modalActionBtn, styles.rejectBtn]}
                                                    onPress={() => setShowRejectInput(true)}
                                                >
                                                    <Text style={styles.actionBtnText}>Reject</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.rejectInputContainer}>
                                                <Text style={styles.rejectInputLabel}>Rejection Reason</Text>
                                                <TextInput
                                                    style={styles.rejectInput}
                                                    placeholder="Enter reason for rejection..."
                                                    placeholderTextColor="#94a3b8"
                                                    multiline
                                                    value={rejectionReason}
                                                    onChangeText={setRejectionReason}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.rejectSubmitBtn, { opacity: rejectionReason.trim() ? 1 : 0.6 }]}
                                                    disabled={!rejectionReason.trim()}
                                                    onPress={() => handleAction(selectedProvider.id, 'reject', rejectionReason)}
                                                >
                                                    <Text style={styles.rejectSubmitText}>Submit Rejection</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.cancelRejectBtn}
                                                    onPress={() => setShowRejectInput(false)}
                                                >
                                                    <Text style={styles.cancelRejectText}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerOverlay}>
                    <TouchableOpacity 
                        style={styles.viewerClose}
                        onPress={() => setViewerVisible(false)}
                    >
                        <Ionicons name="close" size={moderateScale(32)} color="#fff" />
                    </TouchableOpacity>
                    {viewerImage && (
                        <Image 
                            source={{ uri: viewerImage }} 
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
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
        paddingBottom: verticalScale(40),
        maxHeight: '90%',
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
    modalProfileHeader: {
        alignItems: 'center',
        marginVertical: verticalScale(25),
    },
    largeAvatar: {
        width: moderateScale(90),
        height: moderateScale(90),
        borderRadius: moderateScale(45),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#115e59',
        marginBottom: verticalScale(15),
    },
    largeAvatarText: {
        color: '#115e59',
        fontSize: moderateScale(32),
        fontWeight: 'bold',
    },
    modalUserName: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    detailSection: {
        marginBottom: verticalScale(25),
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: verticalScale(15),
        letterSpacing: 1,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: scale(15),
        borderRadius: moderateScale(15),
        marginBottom: verticalScale(10),
    },
    detailInfo: {
        marginLeft: scale(15),
    },
    detailLabel: {
        fontSize: moderateScale(11),
        color: '#64748b',
        marginBottom: verticalScale(2),
    },
    detailValue: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#0f172a',
    },
    statsRowModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: scale(15),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginHorizontal: scale(5),
    },
    statNumber: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#115e59',
        marginBottom: verticalScale(5),
    },
    modalActionRow: {
        flexDirection: 'row',
        gap: scale(10),
        marginTop: verticalScale(10),
    },
    modalActionBtn: {
        flex: 1,
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* Documents Gallery */
    docsGallery: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -scale(5),
    },
    docItem: {
        width: (Dimensions.get('window').width - scale(60)) / 2,
        margin: scale(5),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        padding: scale(8),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    docImageContainer: {
        width: '100%',
        height: verticalScale(100),
        borderRadius: moderateScale(8),
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    docImage: {
        width: '100%',
        height: '100%',
    },
    docStatusBadge: {
        position: 'absolute',
        top: scale(5),
        right: scale(5),
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        borderRadius: scale(4),
    },
    docStatusText: {
        fontSize: scale(8),
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    docLabelText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#334155',
        marginTop: verticalScale(8),
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    emptyDocs: {
        alignItems: 'center',
        paddingVertical: verticalScale(20),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(15),
    },
    emptyDocsText: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        marginTop: verticalScale(8),
    },
    rejectInputContainer: {
        marginTop: verticalScale(10),
        backgroundColor: '#fff1f2',
        padding: scale(15),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    rejectInputLabel: {
        fontSize: moderateScale(12),
        fontWeight: 'bold',
        color: '#be123c',
        marginBottom: verticalScale(8),
    },
    rejectInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fca5a5',
        borderRadius: moderateScale(8),
        padding: scale(10),
        minHeight: verticalScale(80),
        textAlignVertical: 'top',
        fontSize: moderateScale(14),
        color: '#334155',
    },
    rejectSubmitBtn: {
        backgroundColor: '#e11d48',
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        marginTop: verticalScale(12),
    },
    rejectSubmitText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
    cancelRejectBtn: {
        paddingVertical: verticalScale(8),
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    cancelRejectText: {
        color: '#64748b',
        fontSize: moderateScale(12),
        fontWeight: '600',
    },
    /* Image Viewer */
    viewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerClose: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
        right: scale(20),
        zIndex: 10,
        padding: scale(10),
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
});

export default ProvidersScreen;
