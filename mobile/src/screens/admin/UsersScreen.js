import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList,
    ActivityIndicator, RefreshControl, StatusBar, TextInput, Modal,
    ScrollView, Alert, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const { width } = Dimensions.get('window');

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', name: '', email: '', phone: '', city: '', specialty: '', status: '' });
    const [updating, setUpdating] = useState(false);
    const [userType, setUserType] = useState('customer');

    // Details logic
    const [details, setDetails] = useState([]);
    const [providerStats, setProviderStats] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            if (userType === 'customer') {
                const res = await api.get('/api/customers');
                if (res.success) {
                    const customers = (res.data || []).map(u => ({
                        ...u,
                        displayName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
                        displayRole: 'Customer'
                    })).filter(u => u.role === 'user');
                    setUsers(customers);
                }
            } else {
                const res = await api.get('/api/admin/providers');
                if (res.success) {
                    const providers = (res.data.providers || []).map(p => ({
                        ...p,
                        displayName: p.name || p.email,
                        displayRole: 'Provider',
                        first_name: p.name?.split(' ')[0] || '',
                        last_name: p.name?.split(' ').slice(1).join(' ') || '',
                        booking_count: p.total_jobs || 0
                    }));
                    setUsers(providers);
                }
            }
        } catch (error) {
            console.error(`Error fetching ${userType}s:`, error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [userType]);

    const onRefresh = () => { setRefreshing(true); fetchUsers(); };

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openUserDetails = async (user) => {
        setSelectedUser(user);
        setFormData({
            first_name: user.first_name || '', last_name: user.last_name || '',
            name: user.name || '', email: user.email || '', phone: user.phone || '',
            city: user.city || '', specialty: user.specialty || '', status: user.status || 'pending'
        });
        setEditMode(false);
        setDetails([]);
        setProviderStats(null);
        setModalVisible(true);
        loadDetails(user);
    };

    const loadDetails = async (user) => {
        setLoadingDetails(true);
        try {
            if (userType === 'customer') {
                const res = await api.get(`/api/bookings?email=${encodeURIComponent(user.email)}`);
                if (res.success) setDetails(res.data || []);
            } else {
                const res = await api.get(`/api/admin/provider-jobs?providerId=${user.id}`);
                if (res.success) {
                    setDetails(res.data || []);
                    setProviderStats(res.stats || null);
                    setSelectedUser(prev => ({ ...prev, ...res.provider }));
                }
            }
        } catch (error) {
            console.error('Failed to load details', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            if (userType === 'customer') {
                if (!formData.first_name || !formData.last_name) return Alert.alert('Error', 'First and last name required');
                const res = await api.put(`/api/customers?id=${selectedUser.id}`, { ...formData, role: 'user' });
                if (res.success) { setModalVisible(false); fetchUsers(); }
                else Alert.alert('Error', res.message || 'Update failed');
            } else {
                if (!formData.name) return Alert.alert('Error', 'Name required');
                const res = await api.put(`/api/provider?id=${selectedUser.id}`, {
                    name: formData.name, phone: formData.phone, specialty: formData.specialty,
                    city: formData.city, status: formData.status
                });
                if (res.success) { setModalVisible(false); fetchUsers(); }
                else Alert.alert('Error', res.message || 'Update failed');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            `Delete ${userType === 'customer' ? 'Customer' : 'Provider'}`,
            `Are you sure you want to delete this ${userType}? This will delete all their data permanently.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        try {
                            const endpoint = userType === 'customer' ? `/api/customers?id=${selectedUser.id}` : `/api/provider?id=${selectedUser.id}`;
                            const res = await api.delete(endpoint);
                            if (res.success) { setModalVisible(false); fetchUsers(); }
                            else Alert.alert('Error', res.message || 'Delete failed');
                        } catch (error) { Alert.alert('Error', error.message || 'Delete failed'); }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openUserDetails(item)}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, userType === 'provider' && styles.avatarProvider]}>
                    <Text style={[styles.avatarText, userType === 'provider' && { color: '#0369a1' }]}>
                        {item.displayName?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.displayName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {userType === 'provider' && item.status && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={moderateScale(14)} color="#64748b" />
                    <Text style={styles.contactText}>{item.phone || 'No phone'}</Text>
                </View>
                {userType === 'provider' && (
                    <View style={styles.contactRow}>
                        <Ionicons name="briefcase-outline" size={moderateScale(14)} color="#64748b" />
                        <Text style={styles.contactText}>{item.booking_count || 0} Jobs</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const formatCurrency = (val) => `$${(parseFloat(val) || 0).toFixed(2)}`;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Users Management</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={moderateScale(20)} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={userType === 'customer' ? "Search customers..." : "Search providers..."}
                        value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#94a3b8"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={moderateScale(20)} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, userType === 'customer' && styles.activeTab]} onPress={() => setUserType('customer')}>
                    <Ionicons name="people-outline" size={moderateScale(18)} color={userType === 'customer' ? '#fff' : '#64748b'} />
                    <Text style={[styles.tabText, userType === 'customer' && styles.activeTabText]}>Customers ({userType === 'customer' ? filteredUsers.length : ''})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, userType === 'provider' && styles.activeTabP]} onPress={() => setUserType('provider')}>
                    <Ionicons name="construct-outline" size={moderateScale(18)} color={userType === 'provider' ? '#fff' : '#64748b'} />
                    <Text style={[styles.tabText, userType === 'provider' && styles.activeTabText]}>Providers ({userType === 'provider' ? filteredUsers.length : ''})</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}><ActivityIndicator size="large" color="#115e59" /></View>
            ) : (
                <FlatList
                    data={filteredUsers} renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name={userType === 'customer' ? "people-outline" : "construct-outline"} size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No {userType}s found</Text>
                        </View>
                    }
                />
            )}

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, userType === 'provider' && { height: '95%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{userType === 'customer' ? 'Customer Details' : 'Provider Details'}</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={moderateScale(24)} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        {selectedUser && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: verticalScale(40) }}>
                                {editMode ? (
                                    <View style={styles.editForm}>
                                        {userType === 'customer' ? (
                                            <>
                                                <Text style={styles.inputLabel}>First Name</Text>
                                                <TextInput style={styles.input} value={formData.first_name} onChangeText={t => setFormData({ ...formData, first_name: t })} />
                                                <Text style={styles.inputLabel}>Last Name</Text>
                                                <TextInput style={styles.input} value={formData.last_name} onChangeText={t => setFormData({ ...formData, last_name: t })} />
                                            </>
                                        ) : (
                                            <>
                                                <Text style={styles.inputLabel}>Full Name</Text>
                                                <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />
                                                <Text style={styles.inputLabel}>Specialty</Text>
                                                <TextInput style={styles.input} value={formData.specialty} onChangeText={t => setFormData({ ...formData, specialty: t })} />
                                                <Text style={styles.inputLabel}>City</Text>
                                                <TextInput style={styles.input} value={formData.city} onChangeText={t => setFormData({ ...formData, city: t })} />
                                                <Text style={styles.inputLabel}>Status</Text>
                                                <View style={styles.statusInputWrapper}>
                                                    <TextInput style={styles.input} value={formData.status} onChangeText={t => setFormData({ ...formData, status: t })} autoCapitalize="none" />
                                                    <Text style={styles.hint}>(active, inactive, suspended, pending)</Text>
                                                </View>
                                            </>
                                        )}
                                        <Text style={styles.inputLabel}>Phone</Text>
                                        <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />
                                        <Text style={styles.inputLabel}>Email (Cannot be changed)</Text>
                                        <TextInput style={[styles.input, { backgroundColor: '#f1f5f9', color: '#94a3b8' }]} value={formData.email} editable={false} />

                                        <View style={styles.editActionRow}>
                                            <TouchableOpacity style={[styles.modalActionBtn, styles.saveBtn, userType === 'provider' && { backgroundColor: '#0284c7' }]} onPress={handleUpdate} disabled={updating}>
                                                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Save Changes</Text>}
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.modalActionBtn, styles.cancelBtn]} onPress={() => setEditMode(false)}>
                                                <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.modalProfileHeader}>
                                            <View style={[styles.largeAvatar, userType === 'provider' && { backgroundColor: '#e0f2fe', borderColor: '#0284c7' }]}>
                                                <Text style={[styles.largeAvatarText, userType === 'provider' && { color: '#0369a1' }]}>{selectedUser.displayName?.[0]}</Text>
                                            </View>
                                            <Text style={styles.modalUserName}>{selectedUser.displayName}</Text>
                                            <View style={styles.roleBadge}>
                                                <Text style={styles.roleText}>{userType === 'customer' ? 'Customer' : `Provider (${selectedUser.status})`}</Text>
                                            </View>
                                        </View>

                                        {userType === 'provider' && (
                                            <>
                                                {/* Financials Row */}
                                                <View style={styles.statsGrid}>
                                                    <View style={[styles.statBoxS, { backgroundColor: '#f0fdf4' }]}><Text style={styles.statLabelS}>Total Earnings</Text><Text style={[styles.statValM, { color: '#16a34a' }]}>{formatCurrency(selectedUser.total_earnings)}</Text></View>
                                                    <View style={[styles.statBoxS, { backgroundColor: '#fffbeb' }]}><Text style={styles.statLabelS}>Avail. Balance</Text><Text style={[styles.statValM, { color: '#d97706' }]}>{formatCurrency(selectedUser.available_balance)}</Text></View>
                                                    <View style={[styles.statBoxS, { backgroundColor: '#f8fafc' }]}><Text style={styles.statLabelS}>Pending</Text><Text style={[styles.statValM, { color: '#64748b' }]}>{formatCurrency(selectedUser.pending_balance)}</Text></View>
                                                </View>

                                                {/* Provider Stats Grid */}
                                                {providerStats && (
                                                    <View style={styles.statsGrid}>
                                                        <View style={styles.statBoxS}><Text style={styles.statLabelS}>Total Jobs</Text><Text style={styles.statValM}>{providerStats.totalJobs}</Text></View>
                                                        <View style={styles.statBoxS}><Text style={styles.statLabelS}>Completed</Text><Text style={[styles.statValM, { color: '#16a34a' }]}>{providerStats.completedJobs}</Text></View>
                                                        <View style={styles.statBoxS}><Text style={styles.statLabelS}>Hours Worked</Text><Text style={[styles.statValM, { color: '#0284c7' }]}>{providerStats.totalHoursWorked}h</Text></View>
                                                        <View style={styles.statBoxS}><Text style={styles.statLabelS}>Avg Rating</Text><Text style={[styles.statValM, { color: '#eab308' }]}>⭐ {parseFloat(providerStats.avgRating).toFixed(1)}</Text></View>
                                                    </View>
                                                )}
                                            </>
                                        )}

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Contact & Info</Text>
                                            <View style={styles.infoGrid}>
                                                <View style={styles.infoCol}><Text style={styles.infoL}>Email</Text><Text style={styles.infoV}>{selectedUser.email}</Text></View>
                                                <View style={styles.infoCol}><Text style={styles.infoL}>Phone</Text><Text style={styles.infoV}>{selectedUser.phone || '—'}</Text></View>
                                                {userType === 'provider' && <View style={styles.infoCol}><Text style={styles.infoL}>City</Text><Text style={styles.infoV}>{selectedUser.city || '—'}</Text></View>}
                                                {userType === 'provider' && <View style={styles.infoCol}><Text style={styles.infoL}>Specialty</Text><Text style={styles.infoV}>{selectedUser.specialty || '—'}</Text></View>}
                                                <View style={styles.infoCol}><Text style={styles.infoL}>Joined</Text><Text style={styles.infoV}>{new Date(selectedUser.created_at).toLocaleDateString()}</Text></View>
                                            </View>
                                        </View>

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Job History ({details.length})</Text>
                                            {loadingDetails ? (
                                                <ActivityIndicator color="#115e59" style={{ marginVertical: 20 }} />
                                            ) : details.length > 0 ? (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
                                                    <View>
                                                        <View style={styles.tableRowHeader}>
                                                            <Text style={[styles.tCell, { width: 80 }]}>Booking #</Text>
                                                            <Text style={[styles.tCell, { width: 120 }]}>Service</Text>
                                                            <Text style={[styles.tCell, { width: 90 }]}>Date</Text>
                                                            <Text style={[styles.tCell, { width: 80 }]}>Status</Text>
                                                            {userType === 'provider' && <Text style={[styles.tCell, { width: 80 }]}>Earned</Text>}
                                                        </View>
                                                        {details.map(b => (
                                                            <View key={b.id} style={styles.tableRow}>
                                                                <Text style={[styles.tCellV, { width: 80 }]} numberOfLines={1}>{b.booking_number}</Text>
                                                                <Text style={[styles.tCellV, { width: 120 }]} numberOfLines={1}>{b.service_name}</Text>
                                                                <Text style={[styles.tCellV, { width: 90 }]} numberOfLines={1}>{new Date(b.job_date).toLocaleDateString()}</Text>
                                                                <Text style={[styles.tCellV, { width: 80 }]} numberOfLines={1}>{b.status}</Text>
                                                                {userType === 'provider' && <Text style={[styles.tCellV, { width: 80, color: '#16a34a', fontWeight: 'bold' }]} numberOfLines={1}>{formatCurrency(b.final_provider_amount || b.provider_amount)}</Text>}
                                                            </View>
                                                        ))}
                                                    </View>
                                                </ScrollView>
                                            ) : (
                                                <Text style={styles.emptyTxt}>No history found.</Text>
                                            )}
                                        </View>

                                        <View style={styles.modalActionRow}>
                                            <TouchableOpacity style={[styles.modalActionBtn, styles.editBtn, userType === 'provider' && { backgroundColor: '#0284c7' }]} onPress={() => setEditMode(true)}>
                                                <Ionicons name="create-outline" size={moderateScale(20)} color="#fff" />
                                                <Text style={styles.actionBtnText}>Edit {userType === 'customer' ? 'Customer' : 'Provider'}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.modalActionBtn, styles.deleteBtn]} onPress={handleDelete}>
                                                <Ionicons name="trash-outline" size={moderateScale(20)} color="#fff" />
                                                <Text style={styles.actionBtnText}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: scale(20), paddingVertical: verticalScale(15), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginTop: Platform.OS === 'android' ? verticalScale(25) : 0 },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    searchContainer: { padding: scale(15), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: moderateScale(10), paddingHorizontal: scale(12), height: verticalScale(40) },
    searchInput: { flex: 1, marginLeft: scale(10), fontSize: moderateScale(14), color: '#0f172a' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabContainer: { flexDirection: 'row', paddingHorizontal: scale(15), paddingVertical: verticalScale(10), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(8), borderRadius: moderateScale(8), marginHorizontal: scale(5), backgroundColor: '#f1f5f9', gap: scale(6) },
    activeTab: { backgroundColor: '#115e59' },
    activeTabP: { backgroundColor: '#0284c7' },
    tabText: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#64748b' },
    activeTabText: { color: '#fff' },
    listContent: { padding: scale(15) },
    card: { backgroundColor: '#fff', borderRadius: moderateScale(12), padding: scale(15), marginBottom: verticalScale(12), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12) },
    avatar: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#115e5920' },
    avatarProvider: { backgroundColor: '#e0f2fe', borderColor: '#0284c720' },
    avatarText: { color: '#115e59', fontSize: moderateScale(16), fontWeight: 'bold' },
    userInfo: { flex: 1, marginLeft: scale(12) },
    userName: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a' },
    userEmail: { fontSize: moderateScale(12), color: '#64748b', marginTop: verticalScale(2) },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#f1f5f9', borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: verticalScale(10) },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactText: { fontSize: moderateScale(12), color: '#64748b', marginLeft: scale(6) },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(80) },
    emptyText: { fontSize: moderateScale(15), color: '#94a3b8', marginTop: verticalScale(15) },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: moderateScale(20), borderTopRightRadius: moderateScale(20), paddingHorizontal: scale(20), paddingBottom: verticalScale(20), maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: verticalScale(15), borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    closeButton: { padding: scale(5) },
    modalProfileHeader: { alignItems: 'center', marginVertical: verticalScale(20) },
    largeAvatar: { width: moderateScale(70), height: moderateScale(70), borderRadius: moderateScale(35), backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#115e59', marginBottom: verticalScale(10) },
    largeAvatarText: { color: '#115e59', fontSize: moderateScale(28), fontWeight: 'bold' },
    modalUserName: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: scale(12), paddingVertical: verticalScale(4), borderRadius: moderateScale(12), marginTop: verticalScale(6) },
    roleText: { fontSize: moderateScale(11), color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
    detailSection: { marginBottom: verticalScale(20) },
    sectionTitle: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: verticalScale(10) },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f8fafc', borderRadius: 12, padding: 10 },
    infoCol: { width: '50%', padding: 8 },
    infoL: { fontSize: 11, color: '#64748b', marginBottom: 2 },
    infoV: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
    statBoxS: { flex: 1, minWidth: '30%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, alignItems: 'center' },
    statLabelS: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', alignSelf: 'center', textAlign: 'center' },
    statValM: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 4 },
    tableRowHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    tCell: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
    tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    tCellV: { fontSize: 12, color: '#0f172a' },
    emptyTxt: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 15 },
    modalActionRow: { flexDirection: 'row', gap: scale(10), marginTop: verticalScale(10), paddingBottom: 20 },
    modalActionBtn: { flex: 1, flexDirection: 'row', height: verticalScale(45), borderRadius: moderateScale(10), justifyContent: 'center', alignItems: 'center', gap: scale(8) },
    editBtn: { backgroundColor: '#115e59' },
    deleteBtn: { backgroundColor: '#ef4444' },
    actionBtnText: { color: '#fff', fontSize: moderateScale(14), fontWeight: 'bold' },
    editForm: { paddingVertical: verticalScale(5) },
    inputLabel: { fontSize: moderateScale(11), fontWeight: 'bold', color: '#64748b', marginBottom: verticalScale(4) },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(8), padding: scale(10), fontSize: moderateScale(14), color: '#0f172a', marginBottom: verticalScale(12) },
    statusInputWrapper: { position: 'relative' },
    hint: { fontSize: 10, color: '#94a3b8', marginTop: -10, marginBottom: 12 },
    editActionRow: { flexDirection: 'row', gap: scale(10), marginTop: verticalScale(10) },
    saveBtn: { backgroundColor: '#115e59' },
    cancelBtn: { backgroundColor: '#f1f5f9' },
});

export default UsersScreen;
