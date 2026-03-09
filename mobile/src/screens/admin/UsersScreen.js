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
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const UsersScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
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
});

export default UsersScreen;
