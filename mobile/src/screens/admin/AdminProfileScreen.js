import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const AdminProfileScreen = ({ navigation }) => {
    const { user, logout, updateUserInfo } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!formData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/api/user/profile', formData);
            if (res.success) {
                Alert.alert('Success', 'Profile updated successfully');
                setIsEditing(false);
                // Update local auth context if method exists
                if (updateUserInfo) updateUserInfo(res.data);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Profile</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Text style={[styles.editBtnText, { color: isEditing ? '#ef4444' : '#115e59' }]}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=115e59&color=fff&size=200` }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.cameraIcon}>
                                <Ionicons name="camera" size={moderateScale(18)} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Super Admin</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={[styles.inputWrapper, !isEditing && styles.disabledInput]}>
                                <Ionicons name="person-outline" size={moderateScale(20)} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    editable={isEditing}
                                    placeholder="Enter full name"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={[styles.inputWrapper, styles.disabledInput]}>
                                <Ionicons name="mail-outline" size={moderateScale(20)} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    editable={false}
                                />
                                <Ionicons name="lock-closed" size={moderateScale(16)} color="#cbd5e1" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={[styles.inputWrapper, !isEditing && styles.disabledInput]}>
                                <Ionicons name="call-outline" size={moderateScale(20)} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    editable={isEditing}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {isEditing && (
                            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                                <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {!isEditing && (
                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ef4444" />
                            <Text style={styles.logoutBtnText}>Sign Out From Platform</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>Platform Admin Portal v2.4.0</Text>
                        <Text style={styles.footerText}>Secure Session: Active</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    editBtnText: { fontSize: moderateScale(15), fontWeight: 'bold' },
    content: { padding: scale(20) },
    profileHeader: { alignItems: 'center', marginBottom: verticalScale(30) },
    avatarWrapper: {
        width: moderateScale(110),
        height: moderateScale(110),
        borderRadius: moderateScale(55),
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 8,
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        position: 'relative'
    },
    avatar: { width: '100%', height: '100%', borderRadius: moderateScale(55) },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#115e59',
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(17),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff'
    },
    userName: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#0f172a', marginTop: verticalScale(15) },
    roleBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: '#dcfce7'
    },
    roleText: { color: '#166534', fontSize: moderateScale(12), fontWeight: 'bold', textTransform: 'uppercase' },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: scale(24),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
    },
    inputGroup: { marginBottom: verticalScale(20) },
    inputLabel: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#64748b', marginBottom: verticalScale(8), marginLeft: scale(4) },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(15),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        height: verticalScale(55)
    },
    disabledInput: { backgroundColor: '#f1f5f9', opacity: 0.8 },
    input: { flex: 1, marginLeft: scale(12), fontSize: moderateScale(15), color: '#334155', fontWeight: '500' },
    saveBtn: {
        backgroundColor: '#115e59',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        marginTop: verticalScale(10),
        elevation: 4,
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(30),
        padding: scale(16),
        borderRadius: moderateScale(15),
        backgroundColor: '#fee2e2',
    },
    logoutBtnText: { color: '#ef4444', fontSize: moderateScale(15), fontWeight: 'bold', marginLeft: scale(10) },
    footerInfo: { alignItems: 'center', marginTop: verticalScale(30), marginBottom: verticalScale(40) },
    footerText: { color: '#94a3b8', fontSize: moderateScale(11), marginBottom: verticalScale(4) }
});

export default AdminProfileScreen;
