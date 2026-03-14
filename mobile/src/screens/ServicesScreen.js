import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { apiService } from '../services/api';
import { API_BASE_URL } from '../config';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

const ServicesScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const categoryId = route?.params?.categoryId;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchServices();
    }, [categoryId]);

    const fetchServices = async () => {
        try {
            if (!refreshing) setLoading(true);
            const params = categoryId ? { categoryId } : {};
            const response = await apiService.get('/api/services', params);
            if (response.success) {
                setServices(response.data);
                setError(null);
            } else {
                setError('Failed to load services');
            }
        } catch (err) {
            setError('An error occurred while fetching services');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const filteredServices = useMemo(() => {
        if (!searchQuery) return services;
        return services.filter(service => 
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Details', { service: item })}
        >
            <View style={styles.imageContainer}>
                {item.image_url ? (
                    <Image 
                        source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}` }} 
                        style={styles.image} 
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="construct-outline" size={30} color="#cbd5e1" />
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.price}>${item.base_price || item.price || '0.00'}</Text>
                    <View style={styles.arrowCircle}>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
            <View style={styles.headerTop}>
                {navigation.canGoBack() ? (
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>
                    {categoryId ? 'Category Services' : 'Our Services'}
                </Text>
                <View style={{ width: 40 }} /> 
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a service..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Fetching best services for you...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {renderHeader()}
            
            {error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredServices}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={PRIMARY} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={80} color="#e2e8f0" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? `No matches for "${searchQuery}"` : 'No services found at the moment'}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: verticalScale(100) }} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 15, color: '#64748b', fontSize: 16 },
    
    /* Header Styles */
    header: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1e293b',
    },

    /* List & Cards */
    list: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    imageContainer: { padding: 10 },
    image: { width: 100, height: 110, borderRadius: 15 },
    placeholderImage: { 
        width: 100, 
        height: 110, 
        borderRadius: 15, 
        backgroundColor: '#f8fafc', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    info: { flex: 1, padding: 15, justifyContent: 'space-between' },
    name: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    description: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    price: { fontSize: 18, fontWeight: 'bold', color: PRIMARY },
    arrowCircle: { 
        width: 28, 
        height: 28, 
        borderRadius: 14, 
        backgroundColor: PRIMARY, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    /* Misc */
    errorText: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 15, marginBottom: 20 },
    retryButton: { backgroundColor: PRIMARY, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: 16, paddingHorizontal: 40 },
});

export default ServicesScreen;
