import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#115e59';

const SavedAddressesScreen = ({ navigation }) => {
    const { token } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        address_line1: '',
        address_line2: '',
        city: 'Calgary',
        postal_code: '',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await apiService.user.addresses.list(token);
            if (res.success) {
                setAddresses(res.data);
            }
        } catch (error) {
            console.error('Fetch addresses error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEdit = async () => {
        if (!form.name || !form.address_line1 || !form.city) {
            Alert.alert('Error', 'Please fill in required fields.');
            return;
        }

        try {
            setSaving(true);
            let res;
            if (editMode) {
                res = await apiService.user.addresses.update(currentId, form, token);
            } else {
                res = await apiService.user.addresses.add(form, token);
            }

            if (res.success) {
                setModalVisible(false);
                fetchAddresses();
                resetForm();
            } else {
                Alert.alert('Error', res.message || 'Failed to save address.');
            }
        } catch (error) {
            console.error('Save address error:', error);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        const res = await apiService.user.addresses.delete(id, token);
                        if (res.success) fetchAddresses();
                    } catch (error) {
                        console.error('Delete address error:', error);
                    }
                }
            }
        ]);
    };

    const openEdit = (address) => {
        setForm({
            name: address.name,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city || 'Calgary',
            postal_code: address.postal_code || '',
            is_default: !!address.is_default
        });
        setCurrentId(address.id);
        setEditMode(true);
        setModalVisible(true);
    };

    const resetForm = () => {
        setForm({
            name: '',
            address_line1: '',
            address_line2: '',
            city: 'Calgary',
            postal_code: '',
            is_default: false
        });
        setEditMode(false);
        setCurrentId(null);
    };

    const renderItem = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.addressName}>{item.name}</Text>
                    {item.is_default ? (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Default</Text>
                        </View>
                    ) : null}
                </View>
                <Text style={styles.addressDetails}>{item.address_line1}</Text>
                {item.address_line2 ? <Text style={styles.addressDetails}>{item.address_line2}</Text> : null}
                <Text style={styles.addressDetails}>{item.city}{item.postal_code ? `, ${item.postal_code}` : ''}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color={PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Addresses</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="location-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No saved addresses yet.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity 
                style={styles.addBtn} 
                onPress={() => { resetForm(); setModalVisible(true); }}
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addBtnText}>Add New Address</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editMode ? 'Edit Address' : 'New Address'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                            <ScrollView>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address Label (e.g. Home, Work) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.name}
                                        onChangeText={val => setForm({ ...form, name: val })}
                                        placeholder="e.g. My Flat"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address Line 1 *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.address_line1}
                                        onChangeText={val => setForm({ ...form, address_line1: val })}
                                        placeholder="Street name and number"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address Line 2 (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.address_line2}
                                        onChangeText={val => setForm({ ...form, address_line2: val })}
                                        placeholder="Suite, unit, etc."
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>City *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={form.city}
                                            onChangeText={val => setForm({ ...form, city: val })}
                                            placeholder="Calgary"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Postal Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={form.postal_code}
                                            onChangeText={val => setForm({ ...form, postal_code: val })}
                                            placeholder="T2P 2M1"
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={styles.checkboxRow}
                                    onPress={() => setForm({ ...form, is_default: !form.is_default })}
                                >
                                    <Ionicons 
                                        name={form.is_default ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color={PRIMARY} 
                                    />
                                    <Text style={styles.checkboxLabel}>Set as default address</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
                                    onPress={handleAddEdit}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 100 },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
    },
    addressInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    addressName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    defaultBadge: {
        backgroundColor: '#f0fdfa',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#ccfbf1',
    },
    defaultText: { fontSize: 10, color: PRIMARY, fontWeight: 'bold' },
    addressDetails: { fontSize: 14, color: '#64748b', marginTop: 2 },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 8, marginLeft: 5 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', marginTop: 15, fontSize: 16 },
    addBtn: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        elevation: 4,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    row: { flexDirection: 'row' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    checkboxLabel: { marginLeft: 10, fontSize: 14, color: '#475569' },
    saveBtn: {
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default SavedAddressesScreen;
