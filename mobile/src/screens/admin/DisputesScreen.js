import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, StatusBar, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const DisputesScreen = ({ navigation }) => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchDisputes = async () => {
        try {
            const res = await api.get('/api/admin/disputes');
            if (res.success) {
                setDisputes(res.data.disputes || []);
            }
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDisputes();
    };

    const handleOpenResolve = (dispute) => {
        setSelectedDispute(dispute);
        setAdminNotes(dispute.admin_notes || '');
        setNewStatus(dispute.status);
        setModalVisible(true);
    };

    const handleUpdateDispute = async () => {
        if (!selectedDispute || !newStatus) return;
        
        setUpdating(true);
        try {
            const res = await api.patch('/api/admin/disputes', {
                dispute_id: selectedDispute.id,
                status: newStatus,
                admin_notes: adminNotes
            });

            if (res.success) {
                Alert.alert('Success', 'Dispute updated successfully');
                setModalVisible(false);
                fetchDisputes();
            } else {
                Alert.alert('Error', res.message || 'Failed to update dispute');
            }
        } catch (error) {
            console.error('Error updating dispute:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#ef4444';
            case 'reviewing': return '#3b82f6';
            case 'under_investigation': return '#f59e0b';
            case 'resolved': return '#10b981';
            case 'closed': return '#64748b';
            default: return '#64748b';
        }
    };

    const renderDisputeItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status?.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.disputeTitle}>{item.service_name || 'Service Dispute'}</Text>
                <Text style={styles.bookingRef}>Ref: #{item.booking_number || item.booking_id}</Text>
                <Text style={styles.descriptionText} numberOfLines={2}>{item.reason}</Text>

                <View style={styles.partiesRow}>
                    <View style={styles.partyBox}>
                        <Text style={styles.partyLabel}>Customer</Text>
                        <Text style={styles.partyName}>{item.customer_name}</Text>
                    </View>
                    <Ionicons name="swap-horizontal" size={moderateScale(16)} color="#cbd5e1" style={styles.swapIcon} />
                    <View style={styles.partyBox}>
                        <Text style={styles.partyLabel}>Provider</Text>
                        <Text style={styles.partyName}>{item.provider_name}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity 
                    style={styles.viewBtn}
                    onPress={() => handleOpenResolve(item)}
                >
                    <Text style={styles.viewBtnText}>Review & Resolve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Disputes</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={disputes}
                    renderItem={renderDisputeItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No active disputes found</Text>
                        </View>
                    }
                />
            )}

            {/* Resolve Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Dispute Review</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {selectedDispute && (
                                <>
                                    <View style={styles.disputeInfoBox}>
                                        <Text style={styles.infoLabel}>Booking Reference</Text>
                                        <Text style={styles.infoValue}>#{selectedDispute.booking_number}</Text>
                                        
                                        <Text style={[styles.infoLabel, { marginTop: 12 }]}>Service</Text>
                                        <Text style={styles.infoValue}>{selectedDispute.service_name}</Text>
                                        
                                        <Text style={[styles.infoLabel, { marginTop: 12 }]}>Reason for Dispute</Text>
                                        <View style={styles.reasonHighlight}>
                                            <Text style={styles.reasonText}>{selectedDispute.reason}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.sectionHeading}>Update Status</Text>
                                    <View style={styles.statusOptions}>
                                        {['open', 'reviewing', 'resolved', 'closed'].map(status => (
                                            <TouchableOpacity
                                                key={status}
                                                style={[
                                                    styles.statusOption,
                                                    newStatus === status && { backgroundColor: getStatusColor(status) + '20', borderColor: getStatusColor(status) }
                                                ]}
                                                onPress={() => setNewStatus(status)}
                                            >
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                                                <Text style={[styles.statusOptionText, newStatus === status && { color: getStatusColor(status) }]}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.sectionHeading}>Admin Notes</Text>
                                    <TextInput
                                        style={styles.notesInput}
                                        placeholder="Add notes for the resolution..."
                                        multiline
                                        numberOfLines={4}
                                        value={adminNotes}
                                        onChangeText={setAdminNotes}
                                    />
                                    
                                    {(newStatus === 'resolved' || newStatus === 'closed') && (
                                        <View style={styles.emailNotice}>
                                            <Ionicons name="mail-outline" size={16} color="#0d9488" />
                                            <Text style={styles.emailNoticeText}>Emails will be sent to both parties upon resolution.</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity 
                            style={[styles.updateBtn, updating && { opacity: 0.7 }]}
                            onPress={handleUpdateDispute}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.updateBtnText}>Save Resolution</Text>
                            )}
                        </TouchableOpacity>
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
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: scale(15) },
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
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(10), paddingVertical: verticalScale(5), borderRadius: moderateScale(20) },
    statusDot: { width: moderateScale(6), height: moderateScale(6), borderRadius: moderateScale(3), marginRight: scale(6) },
    statusText: { fontSize: moderateScale(11), fontWeight: 'bold', textTransform: 'uppercase' },
    dateText: { fontSize: moderateScale(11), color: '#94a3b8' },
    cardBody: { marginBottom: verticalScale(15) },
    disputeTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    bookingRef: { fontSize: moderateScale(12), color: '#64748b', fontWeight: '600', marginTop: verticalScale(2) },
    descriptionText: { fontSize: moderateScale(13), color: '#475569', marginTop: verticalScale(8), lineHeight: verticalScale(18) },
    partiesRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(15), backgroundColor: '#f8fafc', padding: scale(10), borderRadius: moderateScale(10) },
    partyBox: { flex: 1 },
    partyLabel: { fontSize: moderateScale(10), color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' },
    partyName: { fontSize: moderateScale(13), fontWeight: '600', color: '#334155' },
    swapIcon: { marginHorizontal: scale(10) },
    cardFooter: { flexDirection: 'row', gap: scale(10), borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: verticalScale(12) },
    viewBtn: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: moderateScale(8), backgroundColor: '#f1f5f9' },
    viewBtnText: { color: '#475569', fontWeight: 'bold', fontSize: moderateScale(13) },
    resolveBtn: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: moderateScale(8), backgroundColor: '#115e59' },
    resolveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(13) },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(100) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(15) },

    /* Modal Styles */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', padding: scale(20) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    modalTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    modalScroll: { flex: 1 },
    disputeInfoBox: { backgroundColor: '#f8fafc', padding: scale(15), borderRadius: 12, marginBottom: verticalScale(20) },
    infoLabel: { fontSize: moderateScale(11), color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
    infoValue: { fontSize: moderateScale(15), color: '#0f172a', fontWeight: '600', marginTop: 2 },
    reasonHighlight: { backgroundColor: '#fff1f2', padding: scale(12), borderRadius: 8, marginTop: 8, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
    reasonText: { fontSize: moderateScale(14), color: '#991b1b', lineHeight: 20, fontStyle: 'italic' },
    sectionHeading: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(12) },
    statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: verticalScale(20) },
    statusOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(12), paddingVertical: verticalScale(8), borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    statusOptionText: { fontSize: moderateScale(13), fontWeight: '600', color: '#64748b', marginLeft: 6 },
    notesInput: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: scale(15), height: verticalScale(100), textAlignVertical: 'top', fontSize: moderateScale(14), color: '#0f172a', marginBottom: verticalScale(15) },
    emailNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdfa', padding: scale(12), borderRadius: 8, marginBottom: verticalScale(20) },
    emailNoticeText: { fontSize: moderateScale(12), color: '#0d9488', marginLeft: 8, flex: 1 },
    updateBtn: { backgroundColor: '#115e59', paddingVertical: verticalScale(15), borderRadius: 12, alignItems: 'center', marginBottom: verticalScale(10) },
    updateBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
});

export default DisputesScreen;
