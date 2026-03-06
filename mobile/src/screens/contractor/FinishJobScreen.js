import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, Alert, ActivityIndicator, TextInput, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const FinishJobScreen = ({ navigation, route }) => {
    const { job } = route.params || {};
    const [afterPhotos, setAfterPhotos] = useState([]);
    const [summary, setSummary] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [loading, setLoading] = useState(false);

    const addAfterPhoto = async () => {
        if (afterPhotos.length >= 3) {
            Alert.alert('Max Photos', 'You can upload a maximum of 3 after-photos.');
            return;
        }
        Alert.alert('Add After Photo', 'Choose source', [
            {
                text: 'Camera', onPress: async () => {
                    const perm = await ImagePicker.requestCameraPermissionsAsync();
                    if (!perm.granted) return;
                    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
                    if (!result.canceled) setAfterPhotos(p => [...p, result.assets[0].uri]);
                }
            },
            {
                text: 'Gallery', onPress: async () => {
                    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!perm.granted) return;
                    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
                    if (!result.canceled) setAfterPhotos(p => [...p, result.assets[0].uri]);
                }
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleFinishJob = async () => {
        if (afterPhotos.length === 0) {
            Alert.alert('After Photos Required', 'Please add at least 1 after-photo to complete the job.');
            return;
        }
        if (!summary.trim()) {
            Alert.alert('Work Summary Required', 'Please provide a brief summary of the work done.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/job/complete', {
                booking_id: job?.id,
                summary,
                recommendations,
            });
            Alert.alert(
                'Job Submitted!',
                'The customer will review your work and approve payment. Great job!',
                [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
            );
        } catch (err) {
            Alert.alert('Error', 'Failed to submit job. Please try again.');
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

                <Text style={styles.title}>Finish Job</Text>
                <Text style={styles.subtitle}>{job?.service_name}</Text>

                {/* After Photos */}
                <Text style={styles.sectionTitle}>📷 After Photos (1-3 required)</Text>
                <View style={styles.photosRow}>
                    {afterPhotos.map((uri, i) => (
                        <View key={i} style={styles.photoThumb}>
                            <Image source={{ uri }} style={styles.thumbImage} />
                            <TouchableOpacity
                                style={styles.removePhoto}
                                onPress={() => setAfterPhotos(p => p.filter((_, idx) => idx !== i))}
                            >
                                <Text style={styles.removeX}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {afterPhotos.length < 3 && (
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={addAfterPhoto}>
                            <Text style={styles.addPhotoIcon}>+</Text>
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Work Summary */}
                <Text style={styles.sectionTitle}>📝 Work Summary *</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Describe the work you completed..."
                    multiline
                    numberOfLines={5}
                    value={summary}
                    onChangeText={setSummary}
                    textAlignVertical="top"
                />

                {/* Recommendations */}
                <Text style={styles.sectionTitle}>💡 Future Recommendations (Optional)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Any future maintenance suggestions for the customer..."
                    multiline
                    numberOfLines={4}
                    value={recommendations}
                    onChangeText={setRecommendations}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.finishBtn, loading && styles.btnDisabled]}
                    onPress={handleFinishJob}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finishBtnText}>✔ Submit & Complete Job</Text>}
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
    sectionTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(12), marginTop: verticalScale(8) },
    photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: verticalScale(20) },
    photoThumb: { width: moderateScale(90), height: moderateScale(90), borderRadius: moderateScale(10), overflow: 'hidden' },
    thumbImage: { width: '100%', height: '100%' },
    removePhoto: {
        position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    },
    removeX: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    addPhotoBtn: {
        width: moderateScale(90), height: moderateScale(90), borderRadius: moderateScale(10),
        backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed',
    },
    addPhotoIcon: { fontSize: moderateScale(28), color: '#94a3b8' },
    addPhotoText: { fontSize: moderateScale(11), color: '#94a3b8' },
    textArea: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: moderateScale(12), padding: moderateScale(14),
        fontSize: moderateScale(15), color: '#0f172a', marginBottom: verticalScale(16),
        minHeight: verticalScale(100),
    },
    finishBtn: {
        backgroundColor: '#14b8a6', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center', marginTop: verticalScale(8),
    },
    btnDisabled: { opacity: 0.6 },
    finishBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
});

export default FinishJobScreen;
