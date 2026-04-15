import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Platform, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import PremiumAlert from '../../components/PremiumAlert';

const DocumentUploadScreen = ({ navigation, route }) => {
    const { token, updateUser, user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    const isEntryPoint = route.params?.isEntryPoint === true;

    const profile = route.params?.profile || {
        bio: user?.bio || '',
        primarySpecialty: user?.specialty || '',
        yearsExperience: String(user?.experience_years || ''),
        businessAddress: user?.location || '',
        city: user?.city || '',
        serviceAreas: user?.service_areas
            ? (typeof user.service_areas === 'string' ? JSON.parse(user.service_areas) : user.service_areas)
            : [],
        skills: user?.skills
            ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills)
            : [],
    };

    const [documents, setDocuments] = useState({
        profile_photo: null,
        id_proof: null,
        trade_license: null,
        insurance: null,
    });
    const [uploadingSlots, setUploadingSlots] = useState({
        profile_photo: false,
        id_proof: false,
        trade_license: false,
        insurance: false,
    });
    // Keeps the last successfully uploaded URL so the card shows the old image while re-uploading
    const [prevDocuments, setPrevDocuments] = useState({
        profile_photo: null,
        id_proof: null,
        trade_license: null,
        insurance: null,
    });
    const [globalLoading, setGlobalLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Uploading...');
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [hasRejections, setHasRejections] = useState(false);

    React.useEffect(() => {
        const fetchExistingDocs = async () => {
            if (!token) return;
            try {
                const res = await apiService.provider.onboarding.getDocuments(token);
                if (res.success && res.documents?.length > 0) {
                    const newDocs = { profile_photo: null, id_proof: null, trade_license: null, insurance: null };
                    const reasons = {};
                    let foundRejection = false;
                    res.documents.forEach(doc => {
                        const url = doc.document_url.startsWith('http')
                            ? doc.document_url
                            : `${API_BASE_URL}${doc.document_url}`;
                        if (doc.document_type in newDocs) {
                            newDocs[doc.document_type] = url;
                            if (doc.status === 'rejected') {
                                reasons[doc.document_type] = doc.rejection_reason;
                                foundRejection = true;
                            }
                        }
                    });
                    setDocuments(newDocs);
                    setPrevDocuments(newDocs);
                    setRejectionReasons(reasons);
                    setHasRejections(foundRejection);
                }
            } catch (err) {
                console.error('Failed to fetch existing documents:', err);
            }
        };
        fetchExistingDocs();
    }, [token]);

    const showPremiumAlert = (message, title = '', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    // ─── UPLOAD FIX ──────────────────────────────────────────────────────────
    // Root cause of "Network request failed" on Android:
    //   1. apiService may be setting Content-Type: application/json or multipart
    //      manually — both break the multipart boundary when using FormData.
    //   2. The URI from ImageManipulator on Android sometimes lacks file:// prefix.
    //   3. Some setups need the full absolute API URL rather than a relative path.
    //
    // Fix: bypass apiService for this call, use raw fetch, omit Content-Type header.
    const uploadFile = async (uri, type, label) => {
        setUploadingSlots(prev => ({ ...prev, [type]: true }));
        setGlobalLoading(true);
        setLoadingText(`Optimizing & Uploading ${label}...`);

        try {
            // 1. Compress
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }],
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
            );

            let uploadUri = manipulated.uri;

            // 2. Ensure file:// on Android — manipulator sometimes returns a bare path
            if (Platform.OS === 'android') {
                if (!uploadUri.startsWith('file://') && !uploadUri.startsWith('content://')) {
                    uploadUri = `file://${uploadUri}`;
                }
            }

            // 3. Clean filename
            const rawName = uploadUri.split('/').pop() || `doc_${Date.now()}`;
            const filename = rawName.includes('.') ? rawName : `${rawName}.jpg`;

            // 4. Build FormData with RN object form (uri/name/type)
            const formData = new FormData();
            formData.append('file', {
                uri: uploadUri,
                name: filename,
                type: 'image/jpeg',
            });
            formData.append('type', type);

            // 5. POST — DO NOT set Content-Type; fetch auto-sets multipart + boundary
            const endpoint = `${API_BASE_URL}/api/provider/onboarding/upload-document`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // ✅ No Content-Type here — boundary must be auto-generated
                },
                body: formData,
            });

            const rawText = await response.text();
            let res;
            try {
                res = JSON.parse(rawText);
            } catch {
                throw new Error(`Server error (${response.status}): ${rawText.slice(0, 150)}`);
            }

            if (res.success) {
                const finalUrl = res.fileUrl.startsWith('http')
                    ? res.fileUrl
                    : `${API_BASE_URL}${res.fileUrl}`;
                setDocuments(prev => ({ ...prev, [type]: finalUrl }));
                setPrevDocuments(prev => ({ ...prev, [type]: finalUrl }));
                // Clear rejection label on successful re-upload
                setRejectionReasons(prev => { const n = { ...prev }; delete n[type]; return n; });
                setHasRejections(prev => {
                    // Recalculate
                    const remaining = Object.keys(rejectionReasons).filter(k => k !== type);
                    return remaining.length > 0;
                });
            } else {
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error(`🔥 [Upload] (${type}):`, err);
            let msg = err.message || 'Something went wrong while uploading.';
            if (msg.toLowerCase().includes('network request failed')) {
                msg = 'Network request failed. Please check your connection and try again.';
            }
            showPremiumAlert(msg, 'Upload Failed');
        } finally {
            setUploadingSlots(prev => ({ ...prev, [type]: false }));
            setGlobalLoading(false);
        }
    };

    const pickDocument = async (key, label) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { showPremiumAlert('Please allow access to your photo library.', 'Permission Required'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
        if (!result.canceled) await uploadFile(result.assets[0].uri, key, label);
    };

    const takePhoto = async (key, label) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { showPremiumAlert('Please allow camera access.', 'Permission Required'); return; }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
        if (!result.canceled) await uploadFile(result.assets[0].uri, key, label);
    };

    const showPickOptions = (key, label) => {
        const hasDoc = !!documents[key];
        if (hasDoc) {
            Alert.alert(`Manage ${label}`, 'Choose action', [
                { text: 'View Document', onPress: () => { setViewerImage(documents[key]); setViewerVisible(true); } },
                {
                    text: 'Upload New', onPress: () => Alert.alert(`Upload ${label}`, 'Choose source', [
                        { text: 'Camera', onPress: () => takePhoto(key, label) },
                        { text: 'Gallery', onPress: () => pickDocument(key, label) },
                        { text: 'Cancel', style: 'cancel' },
                    ])
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } else {
            Alert.alert(`Upload ${label}`, 'Choose source', [
                { text: 'Camera', onPress: () => takePhoto(key, label) },
                { text: 'Gallery', onPress: () => pickDocument(key, label) },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const handleNext = () => {
        const { profile_photo, id_proof, insurance } = documents;
        if (!profile_photo || !id_proof || !insurance) {
            const missing = [];
            if (!profile_photo) missing.push('Profile Photo');
            if (!id_proof) missing.push('Government ID');
            if (!insurance) missing.push('Insurance Document');
            showPremiumAlert(`Please upload the following required documents:\n\n• ${missing.join('\n• ')}`, 'Missing Documents');
            return;
        }
        try { apiService.provider.onboarding.updateStep(3, token); } catch (e) { }
        navigation.navigate('BankLink', { profile, documents, profilePhoto: profile_photo, skills: profile.skills || [] });
    };

    // ─── Stepper ──────────────────────────────────────────────────────────────
    const Stepper = () => (
        <View style={styles.stepperContainer}>
            {[
                { label: 'Profile', done: true, active: false },
                { label: 'Documents', done: false, active: true },
                { label: 'Payment', done: false, active: false },
                { label: 'Review', done: false, active: false },
            ].map((s, i) => (
                <React.Fragment key={s.label}>
                    {i > 0 && <View style={[styles.stepLine, (s.done || i === 1) && styles.stepLineActive]} />}
                    <View style={styles.stepGroup}>
                        <View style={[styles.stepCircle, s.done && styles.stepCompleted, s.active && styles.stepActive]}>
                            <Text style={s.done || s.active ? styles.stepTextActive : styles.stepText}>
                                {s.done ? '✓' : i + 1}
                            </Text>
                        </View>
                        <Text style={s.done || s.active ? styles.stepLabelActive : styles.stepLabel}>{s.label}</Text>
                    </View>
                </React.Fragment>
            ))}
        </View>
    );

    // ─── Doc Card — maintains UI during re-upload ─────────────────────────────
    const DocUploadCard = ({ docKey, label, icon, description, required }) => {
        const isUploading = uploadingSlots[docKey];
        // While re-uploading, show the previous image so the card doesn't flash empty
        const displayUrl = isUploading ? prevDocuments[docKey] : documents[docKey];
        const isRejected = !!rejectionReasons[docKey];

        return (
            <TouchableOpacity
                style={[styles.docCard, isRejected && styles.docCardRejected]}
                onPress={() => !isUploading && showPickOptions(docKey, label)}
                disabled={isUploading}
                activeOpacity={0.85}
            >
                {displayUrl ? (
                    // ── Card with image ──────────────────────────────────────
                    <>
                        <Image source={{ uri: displayUrl }} style={styles.docPreview} />
                        {/* Normal state: label + tap-to-change */}
                        {!isUploading && (
                            <View style={styles.docCardOverlay}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
                                    <Ionicons name="checkmark-circle" size={moderateScale(15)} color="#6ee7b7" />
                                    <Text style={styles.docCardLabel}>{label}</Text>
                                </View>
                                <Text style={styles.docCardChange}>Tap to change</Text>
                            </View>
                        )}
                        {/* Re-uploading: semi-transparent dark overlay with spinner over the image */}
                        {isUploading && (
                            <View style={styles.reuploadOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={styles.reuploadText}>Uploading {label}...</Text>
                            </View>
                        )}
                    </>
                ) : isUploading ? (
                    // ── First upload (no previous image) ────────────────────
                    <View style={[styles.docCardInner, { height: verticalScale(110), justifyContent: 'center' }]}>
                        <ActivityIndicator size="large" color="#0d9488" />
                        <Text style={[styles.docDesc, { marginTop: moderateScale(10) }]}>Uploading {label}...</Text>
                    </View>
                ) : (
                    // ── Empty slot ───────────────────────────────────────────
                    <View style={styles.docCardInner}>
                        <Text style={styles.docIcon}>{icon}</Text>
                        <Text style={styles.docLabel}>{label}{required && <Text style={styles.req}> *</Text>}</Text>
                        <Text style={styles.docDesc}>{description}</Text>
                        <View style={styles.uploadBtn}>
                            <Ionicons name="cloud-upload-outline" size={moderateScale(15)} color="#475569" />
                            <Text style={styles.uploadBtnText}>  Upload</Text>
                        </View>
                    </View>
                )}

                {/* Rejection reason strip */}
                {isRejected && (
                    <View style={styles.errorReasonContainer}>
                        <Ionicons name="alert-circle-outline" size={moderateScale(14)} color="#dc2626" />
                        <Text style={styles.errorReasonText}>Rejected: {rejectionReasons[docKey]}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // ─── Modals ───────────────────────────────────────────────────────────────
    const LoadingModal = () => (
        <Modal transparent visible={globalLoading} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.modalText}>{loadingText}</Text>
                    <Text style={styles.modalSubtext}>Please wait, this may take a moment.</Text>
                </View>
            </View>
        </Modal>
    );

    const ImagePreviewModal = () => (
        <Modal visible={viewerVisible} transparent={false} animationType="slide" onRequestClose={() => setViewerVisible(false)}>
            <SafeAreaView style={styles.viewerContainer}>
                <View style={styles.viewerHeader}>
                    <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerVisible(false)}>
                        <Ionicons name="close" size={moderateScale(30)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.viewerTitle}>Document Preview</Text>
                </View>
                <View style={styles.viewerContent}>
                    {viewerImage && <Image source={{ uri: viewerImage }} style={styles.viewerImage} resizeMode="contain" />}
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LoadingModal />
            <ImagePreviewModal />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Stepper />
                <View style={styles.contentCard}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={[styles.backButton, isEntryPoint && styles.backButtonDisabled]}
                            onPress={() => { if (isEntryPoint) return; if (navigation.canGoBack()) navigation.goBack(); }}
                            disabled={isEntryPoint}
                        >
                            <Ionicons name="arrow-back" size={moderateScale(24)} color={isEntryPoint ? '#cbd5e1' : '#115e59'} />
                        </TouchableOpacity>
                        <Text style={[styles.mainTitle, { flex: 1 }]}>Upload Documents</Text>
                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Ionicons name="log-out-outline" size={moderateScale(20)} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Our team needs these to verify your identity</Text>

                    {hasRejections && (
                        <View style={styles.rejectionNotice}>
                            <View style={styles.rejectionHeader}>
                                <Ionicons name="alert-circle" size={moderateScale(22)} color="#dc2626" />
                                <Text style={styles.rejectionTitle}>Documents Rejected</Text>
                            </View>
                            <Text style={styles.rejectionText}>
                                Some documents were not approved. Please re-upload the correct files below.
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>🔒 Your documents are encrypted and only used for verification.</Text>
                    </View>

                    <DocUploadCard docKey="profile_photo" label="Profile Photo" icon="👤" description="Clear, professional photo of yourself" required />
                    <DocUploadCard docKey="id_proof" label="Government-Issued ID" icon="🪪" description="Driver's license, passport, or state ID" required />
                    <DocUploadCard docKey="insurance" label="Insurance Document" icon="🛡️" description="Liability insurance certificate" required />
                    <DocUploadCard docKey="trade_license" label="Trade License / Certification" icon="📜" description="Professional license or trade certificate (optional)" required={false} />

                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>Continue to Bank Link →</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepFooter}>Step 2 of 4</Text>
                    <View style={{ height: Math.max(insets.bottom, 20) }} />
                </View>
            </ScrollView>
            <PremiumAlert visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scroll: { padding: moderateScale(15) },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(20), marginBottom: verticalScale(10) },
    stepGroup: { alignItems: 'center', width: scale(70) },
    stepCircle: { width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15), backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(5), borderWidth: 1, borderColor: '#e2e8f0' },
    stepActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepCompleted: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepText: { color: '#64748b', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepTextActive: { color: '#fff', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepLabel: { fontSize: moderateScale(10), color: '#64748b' },
    stepLabelActive: { fontSize: moderateScale(10), color: '#0d9488', fontWeight: 'bold' },
    stepLine: { width: scale(40), height: 1, backgroundColor: '#e2e8f0', marginHorizontal: -scale(10), zIndex: -1, alignSelf: 'center', marginTop: -verticalScale(20) },
    stepLineActive: { backgroundColor: '#0d9488' },
    contentCard: { backgroundColor: '#fff', borderRadius: moderateScale(12), padding: moderateScale(20), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
    backButton: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
    backButtonDisabled: { opacity: 0.4 },
    mainTitle: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginBottom: verticalScale(20) },
    infoBox: { backgroundColor: '#f0fdfa', borderRadius: moderateScale(10), padding: moderateScale(14), marginBottom: verticalScale(20), borderLeftWidth: 4, borderLeftColor: '#0d9488' },
    infoText: { color: '#0f766e', fontSize: moderateScale(13), lineHeight: 20 },
    docCard: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(12), marginBottom: verticalScale(16), overflow: 'hidden', minHeight: verticalScale(110) },
    docCardRejected: { borderColor: '#fca5a5', borderWidth: 1.5 },
    docCardInner: { padding: moderateScale(20), alignItems: 'center' },
    docPreview: { width: '100%', height: verticalScale(140) },
    docCardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: moderateScale(10) },
    docCardLabel: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(13) },
    docCardChange: { color: '#d1fae5', fontSize: moderateScale(11), marginTop: verticalScale(2) },
    reuploadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    reuploadText: { color: '#fff', fontSize: moderateScale(13), fontWeight: '600', marginTop: verticalScale(10) },
    docIcon: { fontSize: moderateScale(36), marginBottom: verticalScale(8) },
    docLabel: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(4) },
    req: { color: '#ef4444' },
    docDesc: { fontSize: moderateScale(13), color: '#64748b', textAlign: 'center', marginBottom: verticalScale(12) },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(10) },
    uploadBtnText: { color: '#475569', fontWeight: '600', fontSize: moderateScale(14) },
    nextBtn: { backgroundColor: '#0d9488', padding: moderateScale(15), borderRadius: moderateScale(10), alignItems: 'center', marginTop: verticalScale(8) },
    nextBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: 'bold' },
    stepFooter: { textAlign: 'center', color: '#94a3b8', fontSize: moderateScale(12), marginTop: verticalScale(20) },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: moderateScale(30), borderRadius: moderateScale(20), alignItems: 'center', width: '80%', elevation: 10 },
    modalText: { marginTop: verticalScale(20), fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
    modalSubtext: { marginTop: verticalScale(10), fontSize: moderateScale(13), color: '#64748b', textAlign: 'center' },
    rejectionNotice: { backgroundColor: '#fef2f2', borderRadius: moderateScale(12), padding: moderateScale(16), marginBottom: verticalScale(20), borderWidth: 1, borderColor: '#fecaca' },
    rejectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8), gap: scale(8) },
    rejectionTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#991b1b' },
    rejectionText: { fontSize: moderateScale(13), color: '#b91c1c', lineHeight: moderateScale(20) },
    errorReasonContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f2', paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(8), borderTopWidth: 1, borderTopColor: '#fecaca', gap: scale(6) },
    errorReasonText: { fontSize: moderateScale(12), color: '#e11d48', fontWeight: '600', flex: 1 },
    viewerContainer: { flex: 1, backgroundColor: '#000' },
    viewerHeader: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(16), backgroundColor: 'rgba(0,0,0,0.8)' },
    viewerCloseBtn: { padding: moderateScale(5) },
    viewerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold', marginRight: moderateScale(30) },
    viewerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    viewerImage: { width: '100%', height: '100%' },
    logoutBtn: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(10),
    },
});

export default DocumentUploadScreen;