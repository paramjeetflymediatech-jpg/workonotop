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
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/customers');
            if (res.success) {
                // Filter to only show users (customers), omitting admins/providers if any
                const customers = (res.data || []).filter(u => u.role === 'user');
                setUsers(customers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
        });
        setEditMode(false);
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!formData.first_name || !formData.last_name || !formData.email) {
            alert('Please fill in required fields');
            return;
        }

        setUpdating(true);
        try {
            const res = await api.put(`/api/customers?id=${selectedUser.id}`, {
                ...formData,
                role: 'user'
            });
            if (res.success) {
                setModalVisible(false);
                fetchUsers();
            } else {
                alert(res.message || 'Update failed');
            }
        } catch (error) {
            alert(error.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                'Delete User',
                'Are you sure you want to delete this user? This will delete all their bookings and data permanently.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const res = await api.delete(`/api/customers?id=${selectedUser.id}`);
                                if (res.success) {
                                    setModalVisible(false);
                                    fetchUsers();
                                } else {
                                    alert(res.message || 'Delete failed');
                                }
                            } catch (error) {
                                alert(error.message || 'Delete failed');
                            }
                        }
                    }
                ]
            );
        });
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openUserDetails(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.first_name?.[0]}{item.last_name?.[0]}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={styles.bookingBadge}>
                    <Text style={styles.bookingCount}>{item.booking_count || 0}</Text>
                    <Text style={styles.bookingLabel}>Jobs</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={moderateScale(14)} color="#64748b" />
                    <Text style={styles.contactText}>{item.phone || 'No phone'}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="calendar-outline" size={moderateScale(14)} color="#64748b" />
                    <Text style={styles.contactText}>Joined {new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
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
                <Text style={styles.headerTitle}>Users</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={moderateScale(20)} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
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
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No users found</Text>
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
                            <Text style={styles.modalTitle}>User Details</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={moderateScale(24)} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        {selectedUser && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {editMode ? (
                                    <View style={styles.editForm}>
                                        <Text style={styles.inputLabel}>First Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.first_name}
                                            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                            placeholder="First Name"
                                        />
                                        <Text style={styles.inputLabel}>Last Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.last_name}
                                            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                            placeholder="Last Name"
                                        />
                                        <Text style={styles.inputLabel}>Email</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.email}
                                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                                            placeholder="Email"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                        <Text style={styles.inputLabel}>Phone</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.phone}
                                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                            placeholder="Phone"
                                            keyboardType="phone-pad"
                                        />

                                        <View style={styles.editActionRow}>
                                            <TouchableOpacity 
                                                style={[styles.modalActionBtn, styles.saveBtn]}
                                                onPress={handleUpdate}
                                                disabled={updating}
                                            >
                                                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Save Changes</Text>}
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.modalActionBtn, styles.cancelBtn]}
                                                onPress={() => setEditMode(false)}
                                            >
                                                <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.modalProfileHeader}>
                                            <View style={styles.largeAvatar}>
                                                <Text style={styles.largeAvatarText}>
                                                    {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                                                </Text>
                                            </View>
                                            <Text style={styles.modalUserName}>
                                                {selectedUser.first_name} {selectedUser.last_name}
                                            </Text>
                                            <View style={styles.roleBadge}>
                                                <Text style={styles.roleText}>Customer</Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Contact Information</Text>
                                            <View style={styles.detailItem}>
                                                <Ionicons name="mail-outline" size={moderateScale(20)} color="#115e59" />
                                                <View style={styles.detailInfo}>
                                                    <Text style={styles.detailLabel}>Email Address</Text>
                                                    <Text style={styles.detailValue}>{selectedUser.email}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.detailItem}>
                                                <Ionicons name="call-outline" size={moderateScale(20)} color="#115e59" />
                                                <View style={styles.detailInfo}>
                                                    <Text style={styles.detailLabel}>Phone Number</Text>
                                                    <Text style={styles.detailValue}>{selectedUser.phone || 'Not provided'}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Platform Activity</Text>
                                            <View style={styles.statsRow}>
                                                <View style={styles.statBox}>
                                                    <Text style={styles.statNumber}>{selectedUser.booking_count || 0}</Text>
                                                    <Text style={styles.statLabel}>Total Jobs</Text>
                                                </View>
                                                <View style={styles.statBox}>
                                                    <Ionicons name="calendar-outline" size={moderateScale(24)} color="#115e59" />
                                                    <Text style={styles.statLabel}>Joined Date</Text>
                                                    <Text style={styles.statDate}>
                                                        {new Date(selectedUser.created_at).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.modalActionRow}>
                                            <TouchableOpacity 
                                                style={[styles.modalActionBtn, styles.editBtn]}
                                                onPress={() => setEditMode(true)}
                                            >
                                                <Ionicons name="create-outline" size={moderateScale(20)} color="#fff" />
                                                <Text style={styles.actionBtnText}>Edit User</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.modalActionBtn, styles.deleteBtn]}
                                                onPress={handleDelete}
                                            >
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
    avatar: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#115e5920',
    },
    avatarText: {
        color: '#115e59',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
        marginLeft: scale(15),
    },
    userName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userEmail: {
        fontSize: moderateScale(13),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    bookingBadge: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(10),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    bookingCount: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#115e59',
    },
    bookingLabel: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: verticalScale(12),
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginLeft: scale(6),
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
    roleBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(15),
        marginTop: verticalScale(8),
    },
    roleText: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: scale(20),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginHorizontal: scale(5),
    },
    statNumber: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#115e59',
        marginBottom: verticalScale(5),
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statDate: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#0f172a',
        marginTop: verticalScale(5),
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        padding: scale(15),
        borderRadius: moderateScale(15),
    },
    statusIndicator: {
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        marginRight: scale(10),
    },
    statusText: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#065f46',
    },
    modalActionRow: {
        flexDirection: 'row',
        gap: scale(10),
        marginTop: verticalScale(10),
    },
    modalActionBtn: {
        flex: 1,
        flexDirection: 'row',
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(8),
    },
    editBtn: {
        backgroundColor: '#115e59',
    },
    deleteBtn: {
        backgroundColor: '#ef4444',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: 'bold',
    },
    editForm: {
        paddingVertical: verticalScale(10),
    },
    inputLabel: {
        fontSize: moderateScale(12),
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: verticalScale(5),
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(10),
        padding: scale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
        marginBottom: verticalScale(15),
    },
    editActionRow: {
        flexDirection: 'row',
        gap: scale(10),
        marginTop: verticalScale(10),
    },
    saveBtn: {
        backgroundColor: '#115e59',
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
    },
});

export default UsersScreen;
