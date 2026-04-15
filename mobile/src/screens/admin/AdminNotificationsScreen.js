import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';

const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';

const AdminNotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/admin/notifications');
            if (response.success) {
                setNotifications(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching admin notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await api.put('/api/admin/notifications', { id });
            if (response.success) {
                setNotifications(prev => 
                    prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await api.put('/api/admin/notifications', { all: true });
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconCircle, { backgroundColor: item.is_read ? '#f1f5f9' : '#f0fdfa' }]}>
                <Ionicons 
                    name={getIconName(item.type)} 
                    size={moderateScale(20)} 
                    color={item.is_read ? '#94a3b8' : TEAL} 
                />
            </View>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    const getIconName = (type) => {
        switch (type) {
            case 'new_provider': return 'person-add-outline';
            case 'new_booking': return 'calendar-outline';
            case 'dispute': return 'alert-circle-outline';
            default: return 'notifications-outline';
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60) ;
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={TEAL} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.some(n => !n.is_read) ? (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.markAll}>Clear all</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: moderateScale(60) }} />
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[TEAL]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={moderateScale(60)} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(16),
        paddingTop: verticalScale(35),
    },
    backBtn: {
        padding: moderateScale(4),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#fff',
    },
    markAll: {
        fontSize: moderateScale(13),
        color: '#fff',
        opacity: 0.9,
    },
    list: {
        paddingVertical: verticalScale(8),
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(16),
        backgroundColor: '#fff',
        marginBottom: verticalScale(1),
    },
    unreadItem: {
        backgroundColor: '#f8fafc',
    },
    iconCircle: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    title: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#64748b',
    },
    unreadText: {
        color: '#0f172a',
        fontWeight: 'bold',
    },
    time: {
        fontSize: moderateScale(11),
        color: '#94a3b8',
    },
    message: {
        fontSize: moderateScale(13),
        color: '#64748b',
        lineHeight: moderateScale(18),
    },
    unreadDot: {
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: TEAL,
        marginLeft: scale(8),
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
        marginTop: verticalScale(16),
        fontWeight: '500',
    },
});

export default AdminNotificationsScreen;
