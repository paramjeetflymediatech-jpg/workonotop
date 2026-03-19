import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, ActivityIndicator, Switch, Alert, Platform, KeyboardAvoidingView, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';

const UpdateProfileScreen = ({ navigation }) => {
    const { user, token, updateUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        hear_about: '',
        receive_offers: false
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await apiService.get(`/api/customers/${user.id}`, {}, token);
            if (res.success && res.data) {
                setForm({
                    first_name: res.data.first_name || '',
                    last_name: res.data.last_name || '',
                    phone: res.data.phone || '',
                    hear_about: res.data.hear_about || '',
                    receive_offers: !!res.data.receive_offers
                });
                if (res.data.image_url) {
                    setProfileImage(res.data.image_url);
                }
            } else {
                Alert.alert('Error', res.message || 'Failed to load profile.');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!form.first_name.trim() || !form.last_name.trim()) {
            Alert.alert('Validation Error', 'First and last name are required.');
            return;
        }

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('first_name', form.first_name);
            formData.append('last_name', form.last_name);
            formData.append('phone', form.phone);
            formData.append('hear_about', form.hear_about);
            formData.append('receive_offers', form.receive_offers);

            // Append image if local
            if (profileImage && !profileImage.startsWith('http')) {
                const filename = profileImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('profile_image', { uri: profileImage, name: filename, type });
            }

            const res = await apiService.put(`/api/customers/${user.id}`, formData, token);

            if (res.success) {
                updateUser({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    phone: res.data.phone,
                    image_url: res.data.image_url || profileImage
                });
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Something went wrong while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#115e59" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Update Profile</Text>
                    <View style={{ width: moderateScale(40) }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Profile Image Picker */}
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imagePickerBubble}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={moderateScale(40)} color="#cbd5e1" />
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Ionicons name="camera" size={moderateScale(14)} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.first_name}
                            onChangeText={(text) => setForm({ ...form, first_name: text })}
                            placeholder="Ex: John"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.last_name}
                            onChangeText={(text) => setForm({ ...form, last_name: text })}
                            placeholder="Ex: Doe"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={user?.email || ''}
                            editable={false}
                        />
                        <Text style={styles.helpText}>Email address cannot be changed.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            placeholder="+1 (403) 000-0000"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>How did you hear about us?</Text>
                        <TextInput
                            style={styles.input}
                            value={form.hear_about}
                            onChangeText={(text) => setForm({ ...form, hear_about: text })}
                            placeholder="e.g. Instagram, from a friend..."
                        />
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Receive news and special offers</Text>
                        <Switch
                            value={form.receive_offers}
                            onValueChange={(val) => setForm({ ...form, receive_offers: val })}
                            trackColor={{ false: '#e2e8f0', true: '#14b8a6' }}
                            thumbColor={'#fff'}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    imagePickerBubble: {
        position: 'relative',
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#14b8a6',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(50),
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(50),
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#115e59',
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#475569',
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        color: '#94a3b8',
    },
    helpText: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        marginTop: verticalScale(6),
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: verticalScale(10),
        marginBottom: verticalScale(30),
        backgroundColor: '#fff',
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    switchLabel: {
        fontSize: moderateScale(15),
        fontWeight: '500',
        color: '#334155',
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: verticalScale(40),
    },
    saveButtonDisabled: {
        backgroundColor: '#94acab',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});

export default UpdateProfileScreen;
