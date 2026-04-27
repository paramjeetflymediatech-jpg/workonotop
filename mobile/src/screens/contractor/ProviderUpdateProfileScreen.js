import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { API_BASE_URL } from '../../config';

const ProviderUpdateProfileScreen = ({ navigation }) => {
    const { user, updateUser, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience_years: '',
        bio: '',
        location: '',
        city: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            if (!refreshing) setLoading(true);
            // Using /api/provider/me which we verified supports mobile tokens and returns full data
            const res = await apiService.provider.me(token);
            if (res.success && res.provider) {
                const p = res.provider;
                setForm({
                    name: p.name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    specialty: p.specialty || '',
                    experience_years: p.experience_years ? String(p.experience_years) : '',
                    bio: p.bio || '',
                    location: p.location || '',
                    city: p.city || ''
                });
                if (p.avatar_url) {
                    setProfileImage(p.avatar_url.startsWith('http') ? p.avatar_url : `${API_BASE_URL}${p.avatar_url}`);
                }
            } else {
                Alert.alert('Error', res.message || 'Failed to load profile.');
            }
        } catch (error) {
            console.error('Error loading provider profile:', error);
            Alert.alert('Error', 'Failed to load profile.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
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
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            Alert.alert('Validation Error', 'Full name, email and phone are required.');
            return;
        }

        try {
            setSaving(true);

            // We'll use /api/provider (PUT) which supports Bearer tokens as verified in Step 728
            const updateData = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                specialty: form.specialty,
                experience_years: form.experience_years,
                bio: form.bio,
                location: form.location,
                city: form.city,
                // If we had image upload ready for this endpoint we'd add it
                // For now sticking to text fields to fix the 403 error logic
            };

            const res = await apiService.put('/api/provider', updateData, token);

            if (res.success) {
                updateUser({
                    ...user,
                    name: res.data.name,
                    first_name: res.data.name.split(' ')[0], // Compatibility with other screens
                    phone: res.data.phone,
                    image_url: res.data.avatar_url || profileImage
                });
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error saving provider profile:', error);
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
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Provider Profile</Text>
                    <View style={{ width: moderateScale(40) }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                >

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
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholder="Ex: John Doe"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.email}
                            onChangeText={(text) => setForm({ ...form, email: text })}
                            placeholder="Ex: john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            placeholder="+1 (403) 000-0000"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Primary Specialty</Text>
                        <TextInput
                            style={styles.input}
                            value={form.specialty}
                            onChangeText={(text) => setForm({ ...form, specialty: text })}
                            placeholder="e.g. Plumbing, HVAC"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Years of Experience</Text>
                        <TextInput
                            style={styles.input}
                            value={form.experience_years}
                            onChangeText={(text) => setForm({ ...form, experience_years: text })}
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={form.city}
                            onChangeText={(text) => setForm({ ...form, city: text })}
                            placeholder="e.g. Toronto"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Professional Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={form.bio}
                            onChangeText={(text) => setForm({ ...form, bio: text })}
                            placeholder="Tell customers about your expertise..."
                            multiline
                            numberOfLines={4}
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
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: { width: moderateScale(40), height: moderateScale(40), justifyContent: 'center' },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: moderateScale(20) },
    imagePickerContainer: { alignItems: 'center', marginBottom: verticalScale(24) },
    imagePickerBubble: {
        position: 'relative', width: moderateScale(100), height: moderateScale(100),
        borderRadius: moderateScale(50), backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#15843E'
    },
    profileImage: { width: '100%', height: '100%', borderRadius: moderateScale(50) },
    profileImagePlaceholder: { width: '100%', height: '100%', borderRadius: moderateScale(50), justifyContent: 'center', alignItems: 'center' },
    editIconBadge: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: '#115e59',
        width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15),
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
    },
    inputGroup: { marginBottom: verticalScale(16) },
    label: { fontSize: moderateScale(14), fontWeight: '600', color: '#475569', marginBottom: verticalScale(8) },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(12), fontSize: moderateScale(15), color: '#0f172a'
    },
    bioInput: { height: verticalScale(100), textAlignVertical: 'top' },
    saveButton: {
        backgroundColor: '#115e59', paddingVertical: verticalScale(16), borderRadius: moderateScale(14),
        alignItems: 'center', shadowColor: '#115e59', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: verticalScale(40), marginTop: 10
    },
    saveButtonDisabled: { backgroundColor: '#94acab' },
    saveButtonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
});

export default ProviderUpdateProfileScreen;
