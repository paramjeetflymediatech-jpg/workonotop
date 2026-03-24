import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, Image, ActivityIndicator,
    Platform, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import PremiumAlert from '../../components/PremiumAlert';
const DocumentUploadScreen = ({ navigation, route }) => {
    const { token, updateUser, user } = useAuth();
    
    // Recovery logic: if profile is missing from params (e.g. on reload), 
    // we use the data from the authenticated user object.
    const profile = route.params?.profile || {
        bio: user?.bio || '',
        primarySpecialty: user?.specialty || '',
        yearsExperience: String(user?.experience_years || ''),
        businessAddress: user?.location || '',
        city: user?.city || '',
        serviceAreas: user?.service_areas ? (typeof user.service_areas === 'string' ? JSON.parse(user.service_areas) : user.service_areas) : [],
        skills: user?.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
    };
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
    const [globalLoading, setGlobalLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Uploading...');
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [hasRejections, setHasRejections] = useState(false);

    // Fetch existing documents on mount to check for rejections
    React.useEffect(() => {
        const fetchExistingDocs = async () => {
            if (!token) return;
            try {
                const res = await apiService.provider.onboarding.getDocuments(token);
                if (res.success && res.documents?.length > 0) {
                    const newDocs = { ...documents };
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
                    setRejectionReasons(reasons);
                    setHasRejections(foundRejection);
                    
                    if (foundRejection) {
                        console.log('⚠️ [DocUpload] Found rejected documents:', reasons);
                    }
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

    const uploadFile = async (uri, type, label) => {
        setUploadingSlots(prev => ({ ...prev, [type]: true }));
        setGlobalLoading(true);
        setLoadingText(`Optimizing & Uploading ${label}...`);
        try {
            // --- IMAGE COMPRESSION ---
            // Reduce file size significantly before upload
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }], // Reduced from 1000 for better stability
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Reduced from 0.6
            );
            const uploadUri = manipulatedImage.uri;

            const formData = new FormData();
            
            // Normalize filename and extension for Android compatibility
            let filename = uploadUri.split('/').pop() || `upload-${Date.now()}.jpg`;
            
            // Ensure filename has an extension, default to .jpg if missing
            if (!filename.includes('.')) {
                filename += '.jpg';
            }

            // Create the file object for FormData
            const fileToUpload = {
                uri: Platform.OS === 'android' ? uploadUri : uploadUri.replace('file://', ''),
                name: filename,
                type: 'image/jpeg', // Always JPEG after manipulation
            };

            formData.append('file', fileToUpload);
            formData.append('type', type);

            console.log(`📤 [Upload] Starting: ${type}`, { 
                uri: fileToUpload.uri, 
                name: fileToUpload.name, 
                type: fileToUpload.type 
            });

            const res = await apiService.provider.onboarding.uploadDocument(formData, token);

            if (res.success) {
                console.log(`✅ [Upload] Success: ${type}`, res.fileUrl);
                const finalUrl = res.fileUrl.startsWith('http') 
                    ? res.fileUrl 
                    : `${API_BASE_URL}${res.fileUrl}`;
                
                setDocuments(prev => ({ ...prev, [type]: finalUrl }));
            } else {
                console.error(`❌ [Upload] Server Error: ${type}`, res.message);
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error(`🔥 [Upload] Error (${type}):`, err);
            // More descriptive error for 'Network request failed'
            let errorMsg = err.message || 'Something went wrong while uploading.';
            if (errorMsg.includes('Network request failed')) {
                errorMsg = 'Network request failed. This can happen with large files or unstable connections. Please try again.';
            }
            
            showPremiumAlert(errorMsg, 'Upload Failed');
        } finally {
            setUploadingSlots(prev => ({ ...prev, [type]: false }));
            setGlobalLoading(false);
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
            setUploadingSlots(prev => ({ ...prev, [key]: true })); // Start loading immediately after pick
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
            setUploadingSlots(prev => ({ ...prev, [key]: true })); // Start loading immediately after photo
            await uploadFile(result.assets[0].uri, key, label);
        }
    };

    const showPickOptions = (key, label) => {
        if (documents[key]) {
            Alert.alert(`Manage ${label}`, 'Choose action', [
                { text: 'View Document', onPress: () => { setViewerImage(documents[key]); setViewerVisible(true); } },
                { text: 'Upload New', onPress: () => {
                    Alert.alert(`Upload ${label}`, 'Choose source', [
                        { text: 'Camera', onPress: () => takePhoto(key, label) },
                        { text: 'Gallery', onPress: () => pickDocument(key, label) },
                        { text: 'Cancel', style: 'cancel' },
                    ]);
                }},
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
            let missing = [];
            if (!profile_photo) missing.push('Profile Photo');
            if (!id_proof) missing.push('Government ID');
            if (!insurance) missing.push('Insurance Document');
            
            showPremiumAlert(`Please upload the following required documents:\n\n• ${missing.join('\n• ')}`, 'Missing Documents');
            return;
        }
        // Update local state and DB so it doesn't show Document step on reload
        try {
            apiService.provider.onboarding.updateStep(3, token);
        } catch (err) {
            console.error('Failed to update step in DB:', err);
        }
        updateUser({ onboarding_step: 3 });
        navigation.navigate('BankLink', { 
            profile, 
            documents,
            profilePhoto: profile_photo,
            skills: profile.skills || []
        });
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
            {rejectionReasons[docKey] && (
                <View style={styles.errorReasonContainer}>
                    <Ionicons name="alert-circle-outline" size={moderateScale(14)} color="#dc2626" />
                    <Text style={styles.errorReasonText}>Rejected: {rejectionReasons[docKey]}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
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
        <Modal 
            visible={viewerVisible} 
            transparent={false} 
            animationType="slide"
            onRequestClose={() => setViewerVisible(false)}
        >
            <SafeAreaView style={styles.viewerContainer}>
                <View style={styles.viewerHeader}>
                    <TouchableOpacity 
                        style={styles.viewerCloseBtn} 
                        onPress={() => setViewerVisible(false)}
                    >
                        <Ionicons name="close" size={moderateScale(30)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.viewerTitle}>Document Preview</Text>
                </View>
                <View style={styles.viewerContent}>
                    {viewerImage && (
                        <Image 
                            source={{ uri: viewerImage }} 
                            style={styles.viewerImage} 
                            resizeMode="contain" 
                        />
                    )}
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
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={moderateScale(24)} color="#115e59" />
                        </TouchableOpacity>
                        <Text style={styles.mainTitle}>Upload Documents</Text>
                    </View>
                    <Text style={styles.subtitle}>Our team needs these to verify your identity</Text>

                    {hasRejections && (
                        <View style={styles.rejectionNotice}>
                            <View style={styles.rejectionHeader}>
                                <Ionicons name="alert-circle" size={moderateScale(24)} color="#dc2626" />
                                <Text style={styles.rejectionTitle}>Documents Rejected</Text>
                            </View>
                            <Text style={styles.rejectionText}>
                                Some of your documents were not approved. Please review the reasons below and re-upload the correct files.
                            </Text>
                        </View>
                    )}

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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    backButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    mainTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
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
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: moderateScale(30),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        width: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalText: {
        marginTop: verticalScale(20),
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    modalSubtext: {
        marginTop: verticalScale(10),
        fontSize: moderateScale(13),
        color: '#64748b',
        textAlign: 'center',
    },
    /* Rejection Styles */
    rejectionNotice: {
        backgroundColor: '#fef2f2',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    rejectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    rejectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#991b1b',
        marginLeft: scale(8),
    },
    rejectionText: {
        fontSize: moderateScale(13),
        color: '#b91c1c',
        lineHeight: moderateScale(20),
    },
    errorReasonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff1f2',
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#fecaca',
    },
    errorReasonText: {
        fontSize: moderateScale(12),
        color: '#e11d48',
        fontWeight: '600',
        marginLeft: scale(6),
        flex: 1,
    },
    /* Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    viewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(16),
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    viewerCloseBtn: {
        padding: moderateScale(5),
    },
    viewerTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        marginRight: moderateScale(30),
    },
    viewerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '100%',
        height: '100%',
    },
});

export default DocumentUploadScreen;
