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
    TextInput,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const CategoriesScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', slug: '', icon: 'construct-outline', description: '' });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/categories');
            if (res.success) {
                setCategories(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const handleSave = async () => {
        if (!currentCategory.name) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        try {
            let res;
            if (isEditing) {
                res = await api.put(`/api/categories`, currentCategory);
            } else {
                res = await api.post('/api/categories', currentCategory);
            }

            if (res.success) {
                Alert.alert('Success', `Category ${isEditing ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                fetchCategories();
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const res = await api.delete(`/api/categories?id=${id}`);
                        if (res.success) {
                            Alert.alert('Success', 'Category deleted successfully');
                            fetchCategories();
                        }
                    } catch (error) {
                        Alert.alert('Error', error.message);
                    }
                }
            }
        ]);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentCategory({ name: '', slug: '', icon: 'construct-outline', description: '' });
        setModalVisible(true);
    };

    const openEditModal = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setModalVisible(true);
    };

    const renderCategoryItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <View style={styles.categoryIconContainer}>
                    <Ionicons name={item.icon || 'construct-outline'} size={moderateScale(24)} color="#115e59" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryDescription} numberOfLines={1}>
                        {item.description || 'No description provided'}
                    </Text>
                    <Text style={styles.serviceCount}>{item.services_count || 0} Services</Text>
                </View>
            </View>
            <View style={styles.actionColumn}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={moderateScale(18)} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={moderateScale(18)} color="#ef4444" />
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
                <Text style={styles.headerTitle}>Categories</Text>
                <TouchableOpacity onPress={openAddModal}>
                    <Ionicons name="add-circle" size={moderateScale(32)} color="#115e59" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="list-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No categories found</Text>
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
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Category' : 'Add New Category'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={moderateScale(24)} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.inputLabel}>Category Name</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCategory.name}
                                onChangeText={(text) => setCurrentCategory({ ...currentCategory, name: text, slug: text.toLowerCase().replace(/ /g, '-') })}
                                placeholder="Enter category name"
                            />

                            <Text style={styles.inputLabel}>Icon Name (Ionicons)</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCategory.icon}
                                onChangeText={(text) => setCurrentCategory({ ...currentCategory, icon: text })}
                                placeholder="construct-outline"
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={currentCategory.description}
                                onChangeText={(text) => setCurrentCategory({ ...currentCategory, description: text })}
                                placeholder="Enter description"
                                multiline={true}
                                numberOfLines={4}
                            />

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>{isEditing ? 'Update Category' : 'Create Category'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    listContent: { padding: scale(20) },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardInfo: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    categoryIconContainer: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(12),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    textContainer: { flex: 1 },
    categoryName: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    categoryDescription: { fontSize: moderateScale(12), color: '#64748b', marginTop: verticalScale(2) },
    serviceCount: { fontSize: moderateScale(11), color: '#115e59', fontWeight: 'bold', marginTop: verticalScale(4) },
    actionColumn: { alignItems: 'center', justifyContent: 'center' },
    editBtn: { padding: scale(8) },
    deleteBtn: { padding: scale(8) },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(100) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(20) },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: moderateScale(30), borderTopRightRadius: moderateScale(30), paddingBottom: verticalScale(40), maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: scale(25), borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    modalForm: { padding: scale(25) },
    inputLabel: { fontSize: moderateScale(14), fontWeight: '600', color: '#0f172a', marginBottom: verticalScale(8) },
    input: { backgroundColor: '#f8fafc', borderRadius: moderateScale(12), padding: scale(15), fontSize: moderateScale(15), color: '#0f172a', marginBottom: verticalScale(20), borderWidth: 1, borderColor: '#f1f5f9' },
    textArea: { height: verticalScale(100), textAlignVertical: 'top' },
    saveBtn: { backgroundColor: '#115e59', borderRadius: moderateScale(12), padding: scale(18), alignItems: 'center', marginTop: verticalScale(10) },
    saveBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' }
});

export default CategoriesScreen;
