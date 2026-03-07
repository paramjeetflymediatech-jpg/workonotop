import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, ActivityIndicator,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { api } from '../../utils/api';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';

const ProfileSetupScreen = ({ navigation }) => {
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        serviceArea: '',
        bio: '',
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const uploadProfilePhoto = async (uri) => {
        setLoading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type: ext,
            });
            formData.append('type', 'profile_photo');

            const res = await api.post('/api/provider/onboarding/upload-document', formData);

            if (res.success) {
                setProfilePhoto(res.fileUrl || uri);
            } else {
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Profile photo upload error:', err);
            Alert.alert('Upload Failed', 'Failed to upload profile photo.');
        } finally {
            setLoading(false);
        }
    };

    const pickProfilePhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            await uploadProfilePhoto(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        if (!profile.name || !profile.phone || !profile.serviceArea) {
            Alert.alert('Missing Info', 'Please fill in Name, Phone, and Service Area.');
            return;
        }
        navigation.navigate('SkillsSelection', { profile, profilePhoto });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {navigation.canGoBack() && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.title}>Setup Your Profile</Text>
                <Text style={styles.subtitle}>Step 1 of 4 — Tell us about yourself</Text>

                {/* Profile Photo */}
                <TouchableOpacity style={styles.photoPicker} onPress={pickProfilePhoto}>
                    {profilePhoto ? (
                        <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoIcon}>📷</Text>
                            <Text style={styles.photoText}>Upload Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        value={profile.name}
                        onChangeText={(t) => setProfile({ ...profile, name: t })}
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+1 (555) 000-0000"
                        keyboardType="phone-pad"
                        value={profile.phone}
                        onChangeText={(t) => setProfile({ ...profile, phone: t })}
                    />

                    <Text style={styles.label}>Service Area (City/Zip)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. New York, NY 10001"
                        value={profile.serviceArea}
                        onChangeText={(t) => setProfile({ ...profile, serviceArea: t })}
                    />

                    <Text style={styles.label}>Short Bio (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell customers about your experience..."
                        multiline
                        numberOfLines={4}
                        value={profile.bio}
                        onChangeText={(t) => setProfile({ ...profile, bio: t })}
                    />
                </View>

                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Next: Select Skills →</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: moderateScale(24) },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16),
    },
    backIcon: { fontSize: moderateScale(20), color: '#0f172a', fontWeight: 'bold' },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(24) },
    photoPicker: { alignSelf: 'center', marginBottom: verticalScale(24) },
    profilePhoto: {
        width: moderateScale(100), height: moderateScale(100),
        borderRadius: moderateScale(50), borderWidth: 3, borderColor: '#14b8a6',
    },
    photoPlaceholder: {
        width: moderateScale(100), height: moderateScale(100),
        borderRadius: moderateScale(50), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
    },
    photoIcon: { fontSize: moderateScale(28) },
    photoText: { fontSize: moderateScale(11), color: '#64748b', marginTop: 4 },
    form: { width: '100%' },
    label: { fontSize: moderateScale(13), fontWeight: '600', color: '#475569', marginBottom: verticalScale(6), marginTop: verticalScale(12) },
    input: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: moderateScale(12), padding: moderateScale(14),
        fontSize: moderateScale(15), color: '#0f172a',
    },
    textArea: { height: verticalScale(100), textAlignVertical: 'top' },
    nextBtn: {
        backgroundColor: '#14b8a6', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center', marginTop: verticalScale(32),
    },
    nextBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
});

export default ProfileSetupScreen;
