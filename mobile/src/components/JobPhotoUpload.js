import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

const JobPhotoUpload = ({ bookingId, photoType, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [photos, setPhotos] = useState([]);

    const MAX_PHOTOS = photoType === 'before' ? 2 : 3;

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your photos to upload job evidence.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: MAX_PHOTOS,
            quality: 0.7,
        });

        if (!result.canceled) {
            const selectedImages = result.assets.slice(0, MAX_PHOTOS);
            setPhotos(selectedImages);
            setPreviews(selectedImages.map(asset => asset.uri));
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera access to take job photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotos(prev => [...prev, result.assets[0]].slice(0, MAX_PHOTOS));
            setPreviews(prev => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS));
        }
    };

    const uploadPhotos = async () => {
        if (photos.length === 0) return;

        setUploading(true);
        try {
            for (const photo of photos) {
                const formData = new FormData();
                const filename = photo.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('file', {
                    uri: photo.uri,
                    name: filename,
                    type,
                });

                // 1. Upload to /api/upload
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (uploadRes.success) {
                    // 2. Save to /api/provider/jobs/photos
                    await api.post('/api/provider/jobs/photos', {
                        booking_id: bookingId,
                        photo_url: uploadRes.url,
                        photo_type: photoType,
                    });
                }
            }

            setPhotos([]);
            setPreviews([]);
            if (onUploadComplete) onUploadComplete();
            Alert.alert('Success', 'Photos uploaded successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Upload Failed', 'There was an error uploading your photos.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="camera-outline" size={20} color="#0f172a" />
                <Text style={styles.title}>{photoType === 'before' ? 'Before' : 'After'} Photos</Text>
                <Text style={styles.count}>({photos.length}/{MAX_PHOTOS})</Text>
            </View>

            {previews.length > 0 && (
                <View style={styles.previewGrid}>
                    {previews.map((uri, index) => (
                        <View key={index} style={styles.previewContainer}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => {
                                    setPhotos(prev => prev.filter((_, i) => i !== index));
                                    setPreviews(prev => prev.filter((_, i) => i !== index));
                                }}
                            >
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={takePhoto} disabled={uploading || photos.length >= MAX_PHOTOS}>
                    <Ionicons name="camera" size={18} color="#64748b" />
                    <Text style={styles.actionBtnText}>Take</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={pickImages} disabled={uploading || photos.length >= MAX_PHOTOS}>
                    <Ionicons name="images" size={18} color="#64748b" />
                    <Text style={styles.actionBtnText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.uploadBtn, (photos.length === 0 || uploading) && styles.disabledBtn]}
                    onPress={uploadPhotos}
                    disabled={photos.length === 0 || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload" size={18} color="#fff" />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Required: {MAX_PHOTOS} photo{MAX_PHOTOS > 1 ? 's' : ''}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderEraser: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
    title: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    count: { fontSize: 13, color: '#94a3b8' },
    previewGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    previewContainer: { width: scale(80), height: scale(80), borderRadius: 12, overflow: 'hidden', position: 'relative', borderEraser: 1, borderColor: '#e2e8f0' },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 10 },
    btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: verticalScale(40), backgroundColor: '#f8fafc', borderRadius: 10, borderEraser: 1, borderColor: '#e2e8f0' },
    actionBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    uploadBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: verticalScale(40), backgroundColor: '#10b981', borderRadius: 10 },
    uploadBtnText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    disabledBtn: { backgroundColor: '#94a3b8' },
    hint: { fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }
});

export default JobPhotoUpload;
