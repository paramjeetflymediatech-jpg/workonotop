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
    Image,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const ServicesListScreen = ({ navigation }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchServices = async () => {
        try {
            const res = await api.get('/api/services');
            if (res.success) {
                setServices(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredServices = services.filter(service =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.imagePlaceholder}>
                    {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.serviceImage} />
                    ) : (
                        <Ionicons name="settings-outline" size={moderateScale(30)} color="#115e59" />
                    )}
                </View>
                <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category_name}</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.priceValue}>{formatCurrency(item.base_price)}</Text>
                </View>
            </View>

            <View style={styles.cardBottom}>
                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={moderateScale(14)} color="#64748b" />
                    <Text style={styles.metaText}>{item.duration || 'Flexible'} Duration</Text>
                </View>
                <TouchableOpacity style={styles.editIcon}>
                    <Ionicons name="pencil" size={moderateScale(16)} color="#3b82f6" />
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Services</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={moderateScale(20)} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={filteredServices}
                    renderItem={renderServiceItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="settings-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No services found</Text>
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
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
    },
    imagePlaceholder: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(12),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    serviceImage: {
        width: '100%',
        height: '100%'
    },
    serviceInfo: {
        flex: 1,
        marginLeft: scale(15),
    },
    serviceName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(6),
        marginTop: verticalScale(4),
    },
    categoryText: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: 'bold',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: 'bold',
    },
    priceValue: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#115e59',
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: verticalScale(12),
        marginTop: verticalScale(12),
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginLeft: scale(6),
    },
    editIcon: {
        padding: scale(5),
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

export default ServicesListScreen;
