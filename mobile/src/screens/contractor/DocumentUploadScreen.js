import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, Image, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const DocumentUploadScreen = ({ navigation, route }) => {
    const { profile, profilePhoto, skills } = route.params || {};
    const [documents, setDocuments] = useState({
        idPhoto: null,
        licensePhoto: null,
        insuranceDoc: null,
    });
    const [loading, setLoading] = useState(false);

    const uploadFile = async (uri, type, label) => {
        setLoading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? `image/${match[1]}` : 'image';

            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type: ext === 'image/pdf' ? 'application/pdf' : 'image/jpeg',
            });
            formData.append('type', type);

            const res = await api.post('/api/provider/onboarding/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.success) {
                setDocuments(prev => ({ ...prev, [type]: res.fileUrl || uri }));
                Alert.alert('Success', `${label} uploaded successfully.`);
            } else {
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error(`Upload error (${type}):`, err);
            Alert.alert('Upload Failed', err.message || 'Something went wrong while uploading.');
        } finally {
            setLoading(false);
        }
    };

    const pickDocument = async (key, label) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });
        if (!result.canceled) {
            await uploadFile(result.assets[0].uri, key, label);
        }
    };

    const takePhoto = async (key, label) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow camera access.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
        });
        if (!result.canceled) {
            await uploadFile(result.assets[0].uri, key, label);
        }
    };

    const showPickOptions = (key, label) => {
        Alert.alert(`Upload ${label}`, 'Choose source', [
            { text: 'Camera', onPress: () => takePhoto(key, label) },
            { text: 'Gallery', onPress: () => pickDocument(key, label) },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleNext = () => {
        if (!documents.id_proof || !documents.trade_license) {
            Alert.alert('Required Documents', 'Please upload your ID and License photo.');
            return;
        }
        navigation.navigate('BankLink', { profile, profilePhoto, skills, documents });
    };

    const DocUploadCard = ({ docKey, label, icon, description, required }) => (
        <TouchableOpacity
            style={styles.docCard}
            onPress={() => showPickOptions(docKey, label)}
        >
            {documents[docKey] ? (
                <>
                    <Image source={{ uri: documents[docKey] }} style={styles.docPreview} />
                    <View style={styles.docCardOverlay}>
                        <Text style={styles.docCardLabel}>{label}</Text>
                        <Text style={styles.docCardChange}>Tap to change</Text>
                    </View>
                </>
            ) : (
                <View style={styles.docCardInner}>
                    <Text style={styles.docIcon}>{icon}</Text>
                    <Text style={styles.docLabel}>{label} {required && <Text style={styles.req}>*</Text>}</Text>
                    <Text style={styles.docDesc}>{description}</Text>
                    <View style={styles.uploadBtn}>
                        <Text style={styles.uploadBtnText}>📁 Upload</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Upload Documents</Text>
                <Text style={styles.subtitle}>Step 4 of 5 — We need to verify your identity</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>🔒 Your documents are encrypted and only used for verification. They are never shared publicly.</Text>
                </View>

                <DocUploadCard
                    docKey="id_proof"
                    label="Government-Issued ID"
                    icon="🪪"
                    description="Driver's license, passport, or state ID"
                    required
                />

                <DocUploadCard
                    docKey="trade_license"
                    label="Trade License / Certification"
                    icon="📜"
                    description="Professional license or trade certificate"
                    required
                />

                <DocUploadCard
                    docKey="insurance"
                    label="Insurance Document"
                    icon="🛡️"
                    description="Liability insurance (optional but recommended)"
                    required={false}
                />

                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Next: Bank Linking →</Text>
                </TouchableOpacity>

                <Text style={styles.skipText}>Insurance is optional — you can add it later</Text>
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
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(20) },
    infoBox: {
        backgroundColor: '#f0fdfa', borderRadius: moderateScale(12),
        padding: moderateScale(14), marginBottom: verticalScale(20),
        borderLeftWidth: 4, borderLeftColor: '#14b8a6',
    },
    infoText: { color: '#0f766e', fontSize: moderateScale(13), lineHeight: 20 },
    docCard: {
        borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
        borderRadius: moderateScale(16), marginBottom: verticalScale(16),
        overflow: 'hidden', minHeight: verticalScale(110),
    },
    docCardInner: { padding: moderateScale(20), alignItems: 'center' },
    docPreview: { width: '100%', height: verticalScale(140), resizeMode: 'cover' },
    docCardOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: moderateScale(10),
    },
    docCardLabel: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(14) },
    docCardChange: { color: '#cccccc', fontSize: moderateScale(12) },
    docIcon: { fontSize: moderateScale(36), marginBottom: verticalScale(8) },
    docLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(4) },
    req: { color: '#ef4444' },
    docDesc: { fontSize: moderateScale(13), color: '#64748b', textAlign: 'center', marginBottom: verticalScale(12) },
    uploadBtn: {
        backgroundColor: '#f1f5f9', paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(8), borderRadius: moderateScale(10),
    },
    uploadBtnText: { color: '#475569', fontWeight: '600', fontSize: moderateScale(14) },
    nextBtn: {
        backgroundColor: '#14b8a6', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center', marginTop: verticalScale(8),
    },
    nextBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
    skipText: { textAlign: 'center', color: '#94a3b8', fontSize: moderateScale(13), marginTop: verticalScale(12) },
});

export default DocumentUploadScreen;
