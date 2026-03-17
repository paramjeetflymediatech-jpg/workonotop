import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, Image, ActivityIndicator,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import PremiumAlert from '../../components/PremiumAlert';

const DocumentUploadScreen = ({ navigation, route }) => {
    const { profile } = route.params || {};
    const { token, updateUser } = useAuth();
    const [documents, setDocuments] = useState({
        profile_photo: null,
        id_proof: null,
        trade_license: null,
        insurance: null,
    });
    const [loading, setLoading] = useState(false);
    const [uploadingSlots, setUploadingSlots] = useState({
        id_proof: false,
        trade_license: false,
        insurance: false,
    });
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });

    const showPremiumAlert = (message, title = '', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    const uploadFile = async (uri, type, label) => {
        setUploadingSlots(prev => ({ ...prev, [type]: true }));
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

            const res = await apiService.provider.onboarding.uploadDocument(formData, token);

            if (res.success) {
                // Ensure URL is absolute for display
                const finalUrl = res.fileUrl.startsWith('http') 
                    ? res.fileUrl 
                    : `${API_BASE_URL}${res.fileUrl}`;
                
                setDocuments(prev => ({ ...prev, [type]: finalUrl }));
                // Alert.alert('Success', `${label} uploaded successfully.`);
            } else {
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error(`Upload error (${type}):`, err);
            showPremiumAlert(err.message || 'Something went wrong while uploading.', 'Upload Failed');
        } finally {
            setUploadingSlots(prev => ({ ...prev, [type]: false }));
        }
    };

    const pickDocument = async (key, label) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showPremiumAlert('Please allow access to your photo library.', 'Permission Required');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7,
            maxWidth: 1200,
            maxHeight: 1200,
        });
        if (!result.canceled) {
            await uploadFile(result.assets[0].uri, key, label);
        }
    };

    const takePhoto = async (key, label) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showPremiumAlert('Please allow camera access.', 'Permission Required');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7,
            maxWidth: 1200,
            maxHeight: 1200,
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
        const { profile_photo, id_proof, insurance } = documents;
        if (!profile_photo || !id_proof || !insurance) {
            let missing = [];
            if (!profile_photo) missing.push('Profile Photo');
            if (!id_proof) missing.push('Government ID');
            if (!insurance) missing.push('Insurance Document');
            
            showPremiumAlert(`Please upload the following required documents:\n\n• ${missing.join('\n• ')}`, 'Missing Documents');
            return;
        }
        // Update local state so it doesn't show Document step on reload
        updateUser({ onboarding_step: 4 });
        navigation.navigate('BankLink', { profile, documents });
    };

    const Stepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.stepGroup}>
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Text style={styles.stepTextActive}>✓</Text>
                </View>
                <Text style={styles.stepLabelActive}>Profile</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.stepGroup}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                    <Text style={styles.stepTextActive}>2</Text>
                </View>
                <Text style={styles.stepLabelActive}>Documents</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepGroup}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.stepLabel}>Payment</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepGroup}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>4</Text>
                </View>
                <Text style={styles.stepLabel}>Review</Text>
            </View>
        </View>
    );

    const DocUploadCard = ({ docKey, label, icon, description, required }) => (
        <TouchableOpacity
            style={styles.docCard}
            onPress={() => !uploadingSlots[docKey] && showPickOptions(docKey, label)}
            disabled={uploadingSlots[docKey]}
        >
            {uploadingSlots[docKey] ? (
                <View style={[styles.docCardInner, { height: verticalScale(110), justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={[styles.docDesc, { marginTop: 10 }]}>Uploading {label}...</Text>
                </View>
            ) : documents[docKey] ? (
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
                <Stepper />

                <View style={styles.contentCard}>
                    <Text style={styles.mainTitle}>Upload Documents</Text>
                    <Text style={styles.subtitle}>Our team needs these to verify your identity</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>🔒 Your documents are encrypted and only used for verification. They are never shared publicly.</Text>
                    </View>

                    <DocUploadCard
                        docKey="profile_photo"
                        label="Profile Photo"
                        icon="👤"
                        description="Clear, professional photo of yourself"
                        required
                    />

                    <DocUploadCard
                        docKey="id_proof"
                        label="Government-Issued ID"
                        icon="🪪"
                        description="Driver's license, passport, or state ID"
                        required
                    />

                    <DocUploadCard
                        docKey="insurance"
                        label="Insurance Document"
                        icon="🛡️"
                        description="Liability insurance certificate"
                        required
                    />

                    <DocUploadCard
                        docKey="trade_license"
                        label="Trade License / Certification"
                        icon="📜"
                        description="Professional license or trade certificate (optional)"
                        required={false}
                    />

                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>Continue to Bank Link</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepFooter}>Step 2 of 4</Text>
                </View>
            </ScrollView>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scroll: { padding: moderateScale(15) },

    /* Stepper */
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(20),
        marginBottom: verticalScale(10),
    },
    stepGroup: { alignItems: 'center', width: scale(70) },
    stepCircle: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(5),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    stepActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepCompleted: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepText: { color: '#64748b', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepTextActive: { color: '#fff', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepLabel: { fontSize: moderateScale(10), color: '#64748b' },
    stepLabelActive: { fontSize: moderateScale(10), color: '#0d9488', fontWeight: 'bold' },
    stepLine: { width: scale(40), height: 1, backgroundColor: '#e2e8f0', marginHorizontal: -scale(10), zIndex: -1, alignSelf: 'center', marginTop: -verticalScale(20) },
    stepLineActive: { backgroundColor: '#0d9488' },

    /* Content Card */
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    mainTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        marginBottom: verticalScale(20),
    },
    infoBox: {
        backgroundColor: '#f0fdfa', borderRadius: moderateScale(10),
        padding: moderateScale(14), marginBottom: verticalScale(20),
        borderLeftWidth: 4, borderLeftColor: '#0d9488',
    },
    infoText: { color: '#0f766e', fontSize: moderateScale(13), lineHeight: 20 },
    docCard: {
        borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: moderateScale(12), marginBottom: verticalScale(16),
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
        backgroundColor: '#0d9488', padding: moderateScale(15),
        borderRadius: moderateScale(8), alignItems: 'center', marginTop: verticalScale(8),
    },
    nextBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: 'bold' },
    stepFooter: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: moderateScale(12),
        marginTop: verticalScale(20),
    }
});

export default DocumentUploadScreen;
