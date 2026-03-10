import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, Alert, ActivityIndicator, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const StartJobScreen = ({ navigation, route }) => {
    const { job } = route.params || {};
    const [beforePhotos, setBeforePhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const verifyLocation = async () => {
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to verify you are at the job site.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation(loc.coords);

            // Send GPS to backend
            await api.post('/api/job/verify-location', {
                booking_id: job?.id,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            Alert.alert('Location Verified', 'Your location matches the job site!');
        } catch (err) {
            console.error('Location error:', err);
            Alert.alert('Location Error', 'Could not verify location. Please try again.');
        } finally {
            setLocationLoading(false);
        }
    };

    const addBeforePhoto = async () => {
        if (beforePhotos.length >= 2) {
            Alert.alert('Max Photos', 'You can upload a maximum of 2 before-photos.');
            return;
        }
        Alert.alert('Add Photo', 'Choose source', [
            {
                text: 'Camera', onPress: async () => {
                    const perm = await ImagePicker.requestCameraPermissionsAsync();
                    if (!perm.granted) return;
                    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
                    if (!result.canceled) setBeforePhotos(p => [...p, result.assets[0].uri]);
                }
            },
            {
                text: 'Gallery', onPress: async () => {
                    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!perm.granted) return;
                    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
                    if (!result.canceled) setBeforePhotos(p => [...p, result.assets[0].uri]);
                }
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleStartJob = async () => {
        if (beforePhotos.length === 0) {
            Alert.alert('Before Photos Required', 'Please add at least 1 before-photo to start the job.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/job/start', { booking_id: job?.id });
            Alert.alert('Job Started!', 'The customer has been notified that you started the job.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Error', 'Failed to start job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Start Job</Text>
                <Text style={styles.subtitle}>{job?.service_name}</Text>

                {/* Location Verification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Step 1: Verify Your Location</Text>
                    <TouchableOpacity
                        style={[styles.locationBtn, location && styles.locationBtnDone]}
                        onPress={verifyLocation}
                        disabled={locationLoading || !!location}
                    >
                        {locationLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.locationBtnText}>
                                {location ? '✓ Location Verified' : '🔍 Verify My Location'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Before Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📷 Step 2: Before Photos (1-2)</Text>
                    <View style={styles.photosRow}>
                        {beforePhotos.map((uri, i) => (
                            <View key={i} style={styles.photoThumb}>
                                <Image source={{ uri }} style={styles.thumbImage} />
                                <TouchableOpacity
                                    style={styles.removePhoto}
                                    onPress={() => setBeforePhotos(p => p.filter((_, idx) => idx !== i))}
                                >
                                    <Text style={styles.removeX}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {beforePhotos.length < 2 && (
                            <TouchableOpacity style={styles.addPhotoBtn} onPress={addBeforePhoto}>
                                <Text style={styles.addPhotoIcon}>+</Text>
                                <Text style={styles.addPhotoText}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.startBtn, loading && styles.btnDisabled]}
                    onPress={handleStartJob}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>▶ Start Job Now</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: moderateScale(24), paddingBottom: 40 },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16),
    },
    backIcon: { fontSize: moderateScale(20), color: '#0f172a', fontWeight: 'bold' },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(15), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(24) },
    section: {
        backgroundColor: '#f8fafc', borderRadius: moderateScale(16),
        padding: moderateScale(16), marginBottom: verticalScale(16),
    },
    sectionTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(12) },
    locationBtn: {
        backgroundColor: '#3b82f6', padding: moderateScale(14),
        borderRadius: moderateScale(12), alignItems: 'center',
    },
    locationBtnDone: { backgroundColor: '#10b981' },
    locationBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(15) },
    photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    photoThumb: { width: moderateScale(80), height: moderateScale(80), borderRadius: moderateScale(10), overflow: 'hidden' },
    thumbImage: { width: '100%', height: '100%' },
    removePhoto: {
        position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    },
    removeX: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    addPhotoBtn: {
        width: moderateScale(80), height: moderateScale(80), borderRadius: moderateScale(10),
        backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed',
    },
    addPhotoIcon: { fontSize: moderateScale(28), color: '#94a3b8' },
    addPhotoText: { fontSize: moderateScale(11), color: '#94a3b8' },
    startBtn: {
        backgroundColor: '#10b981', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center', marginTop: verticalScale(8),
    },
    btnDisabled: { opacity: 0.6 },
    startBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
});

export default StartJobScreen;
