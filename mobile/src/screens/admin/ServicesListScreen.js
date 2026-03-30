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
    Switch,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';
import { API_BASE_URL } from '../../config';

const ServicesListScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [newService, setNewService] = useState({
        category_id: '',
        name: '',
        slug: '',
        short_description: '',
        description: '',
        base_price: '',
        additional_price: '',
        duration_minutes: '',
        image_url: '',
        use_cases: '',
        is_homepage: false,
        is_trending: false,
        is_popular: false,
        is_active: true
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
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

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/categories');
            if (res.success) {
                setCategories(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
        fetchCategories();
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];
            setImagePreview(selectedImage.uri);
            handleImageUpload(selectedImage);
        }
    };

    const handleImageUpload = async (imageFile) => {
        setUploading(true);
        const formData = new FormData();
        const uriParts = imageFile.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('file', {
            uri: imageFile.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });

        try {
            const res = await api.post('/api/upload', formData);
            if (res.success) {
                setNewService(prev => ({ ...prev, image_url: res.url }));
            } else {
                Alert.alert('Upload Failed', res.message || 'Could not upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveService = async () => {
        if (!newService.category_id || !newService.name || !newService.slug || !newService.base_price) {
            Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
            return;
        }

        setLoading(true);
        try {
            const endpoint = '/api/services';
            const method = isEditMode ? 'put' : 'post';

            const payload = isEditMode ? { ...newService, id: editingServiceId } : newService;
            const res = await api[method](endpoint, payload);
            if (res.success) {
                Alert.alert('Success', `Service ${isEditMode ? 'updated' : 'added'} successfully`);
                closeModal();
                fetchServices();
            }
        } catch (error) {
            Alert.alert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'add'} service`);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingServiceId(null);
        setNewService({
            category_id: '', name: '', slug: '', description: '', short_description: '',
            base_price: '', additional_price: '', duration_minutes: '', image_url: '',
            use_cases: '', is_homepage: false, is_trending: false, is_popular: false,
            is_active: true
        });
        setImagePreview(null);
    };

    const handleEditPress = (service) => {
        setEditingServiceId(service.id);
        setNewService({
            category_id: service.category_id,
            name: service.name,
            slug: service.slug,
            short_description: service.short_description || '',
            description: service.description || '',
            base_price: String(service.base_price),
            additional_price: String(service.additional_price || ''),
            duration_minutes: String(service.duration_minutes || ''),
            image_url: service.image_url || '',
            use_cases: service.use_cases || '',
            is_homepage: !!service.is_homepage,
            is_trending: !!service.is_trending,
            is_popular: !!service.is_popular,
            is_active: !!service.is_active
        });

        let preview = service.image_url;
        if (preview && !preview.startsWith('http')) {
            preview = `${API_BASE_URL}${preview}`;
        }
        setImagePreview(preview);

        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const handleDeletePress = (service) => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await api.delete(`/api/services?id=${service.id}`);
                            if (res.success) {
                                Alert.alert('Deleted', 'Service has been removed.');
                                fetchServices();
                            } else {
                                Alert.alert('Error', res.message || 'Failed to delete service');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    }
                }
            ]
        );
    };

    const handleNameChange = (name) => {
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        setNewService(prev => ({ ...prev, name, slug }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredServices = services.filter(service =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Details', { service: item, hideBooking: true })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.imagePlaceholder}>
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}` }}
                            style={styles.serviceImage}
                        />
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
                    <Text style={styles.metaText}>{item.duration_minutes || 'Flexible'} min</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}
                        onPress={() => handleEditPress(item)}
                    >
                        <Ionicons name="pencil-outline" size={moderateScale(18)} color="#16a34a" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}
                        onPress={() => handleDeletePress(item)}
                    >
                        <Ionicons name="trash-outline" size={moderateScale(18)} color="#dc2626" />
                    </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Services</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={styles.headerBtn}>
                        <Ionicons name="add-outline" size={moderateScale(28)} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                </View>
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

            <Modal
                visible={isAddModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Service' : 'Add New Service'}</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={moderateScale(24)} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category *</Text>
                                <View style={styles.pickerContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {categories.map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.catPickerItem,
                                                    newService.category_id === cat.id && styles.catPickerItemActive
                                                ]}
                                                onPress={() => setNewService({ ...newService, category_id: cat.id })}
                                            >
                                                <Text style={[
                                                    styles.catPickerText,
                                                    newService.category_id === cat.id && styles.catPickerTextActive
                                                ]}>{cat.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Service Name *</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="e.g., Appliance Installation"
                                    value={newService.name}
                                    onChangeText={handleNameChange}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Slug *</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="e.g., appliance-installation"
                                    value={newService.slug}
                                    onChangeText={(slug) => setNewService({ ...newService, slug })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Short Description</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.textArea]}
                                    placeholder="Brief description"
                                    multiline
                                    numberOfLines={2}
                                    value={newService.short_description}
                                    onChangeText={(val) => setNewService({ ...newService, short_description: val })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Description</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.textArea]}
                                    placeholder="Detailed description..."
                                    multiline
                                    numberOfLines={4}
                                    value={newService.description}
                                    onChangeText={(val) => setNewService({ ...newService, description: val })}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.inputLabel}>Base Price ($) *</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={String(newService.base_price)}
                                        onChangeText={(val) => setNewService({ ...newService, base_price: val })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Additional Price ($)</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={String(newService.additional_price)}
                                        onChangeText={(val) => setNewService({ ...newService, additional_price: val })}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="e.g., 120"
                                    keyboardType="numeric"
                                    value={String(newService.duration_minutes)}
                                    onChangeText={(val) => setNewService({ ...newService, duration_minutes: val })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Service Image</Text>
                                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                    {imagePreview ? (
                                        <Image
                                            source={{ uri: imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}` }}
                                            style={styles.previewImage}
                                        />
                                    ) : (
                                        <View style={styles.imagePickerPlaceholder}>
                                            <Ionicons name="camera-outline" size={moderateScale(30)} color="#115e59" />
                                            <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Choose Image'}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.imageNote}>Max 10MB. JPG, PNG, GIF, WebP</Text>
                            </View>

                            <View style={styles.switchSection}>
                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>Homepage</Text>
                                    <Switch
                                        value={newService.is_homepage}
                                        onValueChange={(val) => setNewService({ ...newService, is_homepage: val })}
                                        trackColor={{ false: '#e2e8f0', true: '#115e59' }}
                                    />
                                </View>
                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>Trending</Text>
                                    <Switch
                                        value={newService.is_trending}
                                        onValueChange={(val) => setNewService({ ...newService, is_trending: val })}
                                        trackColor={{ false: '#e2e8f0', true: '#115e59' }}
                                    />
                                </View>
                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>Popular</Text>
                                    <Switch
                                        value={newService.is_popular}
                                        onValueChange={(val) => setNewService({ ...newService, is_popular: val })}
                                        trackColor={{ false: '#e2e8f0', true: '#115e59' }}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Customers use this service for</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.textArea]}
                                    placeholder="Dishwasher Repair, Washer Repair, Dryer Repair..."
                                    multiline
                                    numberOfLines={3}
                                    value={newService.use_cases}
                                    onChangeText={(val) => setNewService({ ...newService, use_cases: val })}
                                />
                                <Text style={styles.imageNote}>Separate with commas.</Text>
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveService}>
                                <Text style={styles.submitBtnText}>{isEditMode ? 'Update Service' : 'Add Service'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
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
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: verticalScale(20),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        marginRight: scale(15),
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
    modalForm: {
        paddingVertical: verticalScale(20),
    },
    inputGroup: {
        marginBottom: verticalScale(20),
    },
    inputLabel: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: verticalScale(8),
    },
    modalInput: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textArea: {
        textAlignVertical: 'top',
        minHeight: verticalScale(80),
    },
    rowInputs: {
        flexDirection: 'row',
    },
    pickerContainer: {
        flexDirection: 'row',
    },
    catPickerItem: {
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        backgroundColor: '#f1f5f9',
        marginRight: scale(10),
    },
    catPickerItemActive: {
        backgroundColor: '#115e59',
    },
    catPickerText: {
        fontSize: moderateScale(13),
        color: '#64748b',
        fontWeight: '600',
    },
    catPickerTextActive: {
        color: '#fff',
    },
    imagePicker: {
        height: verticalScale(150),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(15),
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#115e59',
        overflow: 'hidden',
    },
    imagePickerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: moderateScale(14),
        color: '#115e59',
        fontWeight: '600',
        marginTop: verticalScale(5),
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imageNote: {
        fontSize: moderateScale(11),
        color: '#94a3b8',
        marginTop: verticalScale(5),
    },
    switchSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
        backgroundColor: '#f8fafc',
        padding: scale(15),
        borderRadius: moderateScale(12),
    },
    switchRow: {
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: verticalScale(5),
    },
    submitBtn: {
        backgroundColor: '#115e59',
        height: verticalScale(55),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
        marginBottom: verticalScale(30),
    },
    submitBtnText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
});

export default ServicesListScreen;
