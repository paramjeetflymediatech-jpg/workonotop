import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../utils/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────────────────────────────────────────
// ReviewScreen — mirrors web Step4Review exactly.
//
// Web submit flow (Step4Review → handleSubmit):
//   POST /api/provider/onboarding/complete
//   success → router.push('/provider/pending')   ← ALWAYS goes to pending
//                                                   regardless of status
//   never → dashboard directly from here
//
// Dashboard is only accessible when:
//   user.status === 'active'  (set by admin, not by the provider)
//
// The RootNavigator's key={initialScreen} handles the auto-redirect to Main
// once the admin approves and status changes to 'active' via polling in
// PendingApprovalScreen → updateUser({ status: 'active' }).
// ─────────────────────────────────────────────────────────────────────────────

const ReviewScreen = ({ navigation, route }) => {
    const { user, updateUser, token, logout } = useAuth();
    const insets = useSafeAreaInsets();

    // ── Data from navigation params OR fall back to user object ──────────────
    const profile = route.params?.profile || {
        bio: user?.bio || '',
        primarySpecialty: user?.specialty || '',
        yearsExperience: String(user?.experience_years || ''),
        businessAddress: user?.location || '',
        city: user?.city || '',
        serviceAreas: user?.service_areas
            ? (typeof user.service_areas === 'string'
                ? JSON.parse(user.service_areas)
                : user.service_areas)
            : [],
        skills: user?.skills
            ? (typeof user.skills === 'string'
                ? JSON.parse(user.skills)
                : user.skills)
            : [],
    };
    const { connected } = route.params || {};

    const [loading, setLoading] = useState(false);

    // Live documents fetched from server (mirrors web loadData())
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [providerData, setProviderData] = useState(null);

    // ── Fetch latest docs & provider data on mount (mirrors web loadData()) ──
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch docs
                const docsRes = await apiService.provider.onboarding.getDocuments(token);
                if (docsRes.success && docsRes.documents?.length > 0) {
                    // Keep only latest version per type (same as web)
                    const docMap = new Map();
                    docsRes.documents.forEach(doc => {
                        const existing = docMap.get(doc.document_type);
                        if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
                            docMap.set(doc.document_type, doc);
                        }
                    });
                    setDocuments(Array.from(docMap.values()));
                }
            } catch (err) {
                console.error('[ReviewScreen] Failed to load docs:', err);
            } finally {
                setLoadingDocs(false);
            }
        };
        loadData();
    }, [token]);

    // ── Check required docs (mirrors web hasRequiredDocs) ────────────────────
    const hasRequiredDocs = ['profile_photo', 'id_proof', 'insurance'].every(
        type => documents.some(d => d.document_type === type)
    );

    // ── Stripe status ─────────────────────────────────────────────────────────
    const stripeComplete =
        connected === true ||
        user?.stripe_onboarding_complete === 1 ||
        user?.stripe_onboarding_complete === true ||
        user?.stripe_onboarding_complete === '1';

    // ── Submit — mirrors web handleSubmit exactly ─────────────────────────────
    // Web: POST /complete → success → router.push('/provider/pending')
    //      NEVER navigates to dashboard here.
    //      Dashboard access is gated by status === 'active' in RootNavigator.
    const submitApplication = async () => {
        if (!profile?.bio || profile.bio.trim().length < 50) {
            Alert.alert(
                'Incomplete Profile',
                'Your professional bio must be at least 50 characters. Please go back to Profile Setup.'
            );
            return;
        }

        setLoading(true);
        try {
            // 1. Save profile data
            const profilePayload = {
                bio: profile.bio.trim(),
                specialty: profile.primarySpecialty || '',
                experience_years: parseInt(profile.yearsExperience || '1'),
                city: profile.city || '',
                location: profile.businessAddress || '',
                service_areas: profile.serviceAreas || [],
                skills: profile.skills || [],
            };
            console.log('📦 [Review] Profile payload:', profilePayload);
            await api.post('/api/provider/onboarding/profile', profilePayload);

            // 2. Mark onboarding complete
            console.log('🚀 [Review] Calling onboarding/complete...');
            const res = await api.post('/api/provider/onboarding/complete');
            console.log('✅ [Review] Complete response:', res);

            if (res.success) {
                // Update local user state
                if (updateUser) {
                    await updateUser({
                        onboarding_completed: 1,
                        documents_uploaded: 1,
                        // ✅ Keep status as-is from server — do NOT set status='active' here.
                        // Only admin can activate. We set the status the server returns.
                        status: res.status || 'pending',
                    });
                }

                // ✅ ALWAYS go to PendingApproval after submit — mirrors web router.push('/provider/pending')
                // Even if res.status === 'active' (edge case for pre-approved accounts),
                // RootNavigator will immediately detect active status and redirect to Main.
                // We never manually navigate to Main/Dashboard from ReviewScreen.
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'PendingApproval' }],
                });

            } else {
                throw new Error(res.message || 'Completion failed');
            }
        } catch (err) {
            console.error('[Review] Submit error:', err);
            Alert.alert('Error', err.message || 'Failed to complete onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Doc name map ──────────────────────────────────────────────────────────
    const DOC_NAME_MAP = {
        profile_photo: 'Profile Photo',
        id_proof: 'Government ID',
        insurance: 'Insurance Document',
        trade_license: 'Trade License',
    };

    const getDocStatusColor = (status) => {
        if (status === 'approved') return '#10b981';
        if (status === 'rejected') return '#ef4444';
        return '#f59e0b'; // pending
    };

    const getDocStatusLabel = (status) => {
        if (status === 'approved') return 'Verified';
        if (status === 'rejected') return 'Rejected';
        return 'Pending';
    };

    // ─── Stepper ──────────────────────────────────────────────────────────────
    const Stepper = () => (
        <View style={styles.stepperContainer}>
            {['Profile', 'Docs', 'Payment', 'Review'].map((label, i) => (
                <React.Fragment key={label}>
                    {i > 0 && <View style={[styles.stepLine, styles.stepLineActive]} />}
                    <View style={styles.stepGroup}>
                        <View style={[
                            styles.stepCircle,
                            i < 3 ? styles.stepCompleted : styles.stepActive,
                        ]}>
                            <Text style={styles.stepTextActive}>
                                {i < 3 ? '✓' : '4'}
                            </Text>
                        </View>
                        <Text style={styles.stepLabelActive}>{label}</Text>
                    </View>
                </React.Fragment>
            ))}
        </View>
    );

    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
    );

    if (loadingDocs) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.loadingText}>Loading your information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Stepper />

                <View style={styles.contentCard}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { if (navigation.canGoBack()) navigation.goBack(); }}
                        >
                            <Ionicons name="arrow-back" size={moderateScale(24)} color="#0d9488" />
                        </TouchableOpacity>
                        <Text style={[styles.mainTitle, { flex: 1 }]}>Final Review</Text>
                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Please check your details before submitting</Text>

                    {/* Info banner — mirrors web yellow notice */}
                    <View style={styles.noticeBanner}>
                        <Ionicons name="information-circle-outline" size={moderateScale(16)} color="#92400e" />
                        <Text style={styles.noticeText}>
                            Once submitted, our admin team will review your application within 24–48 hours.
                        </Text>
                    </View>

                    {/* ── Basic Information ─────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <InfoRow label="Name" value={user?.name} />
                        <InfoRow label="Specialty" value={profile.primarySpecialty} />
                        <InfoRow label="Experience" value={`${profile.yearsExperience} years`} />
                        <InfoRow label="City" value={profile.city} />
                        <Text style={styles.bioLabel}>Bio:</Text>
                        <Text style={styles.bioText} numberOfLines={4}>{profile.bio || 'Not provided'}</Text>
                    </View>

                    {/* ── Documents ─────────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Documents ({documents.length})
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('DocumentUpload')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        {documents.length > 0 ? (
                            documents.map((doc, idx) => (
                                <View key={idx} style={styles.docRow}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={moderateScale(18)}
                                        color={getDocStatusColor(doc.status)}
                                    />
                                    <Text style={styles.docName}>
                                        {DOC_NAME_MAP[doc.document_type] || doc.document_type}
                                    </Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getDocStatusColor(doc.status) + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.statusBadgeText,
                                            { color: getDocStatusColor(doc.status) }
                                        ]}>
                                            {getDocStatusLabel(doc.status)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDocsText}>No documents uploaded yet</Text>
                        )}

                        {!hasRequiredDocs && (
                            <View style={styles.missingDocsWarning}>
                                <Ionicons name="alert-circle-outline" size={moderateScale(14)} color="#dc2626" />
                                <Text style={styles.missingDocsText}>
                                    Required documents missing: Profile Photo, Government ID, and Insurance.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ── Payment Setup ─────────────────────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Payment Setup</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('BankLink')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        {stripeComplete ? (
                            <View style={styles.docRow}>
                                <Ionicons name="checkmark-circle" size={moderateScale(18)} color="#10b981" />
                                <Text style={styles.docName}>Bank account linked with Stripe</Text>
                                <View style={[styles.statusBadge, { backgroundColor: '#d1fae5' }]}>
                                    <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Verified</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.stripeOptionalRow}>
                                <Ionicons name="information-circle-outline" size={moderateScale(16)} color="#64748b" />
                                <Text style={styles.stripeOptionalText}>
                                    Bank account not linked — you can connect Stripe after approval (optional for submission).
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ── Terms ─────────────────────────────────────────────── */}
                    <View style={styles.termsBox}>
                        <Text style={styles.termsText}>
                            By submitting, you agree to our Service Provider Terms and confirm that the information provided is accurate.
                        </Text>
                    </View>

                    {/* ── Submit button ─────────────────────────────────────── */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!hasRequiredDocs || loading) && styles.btnDisabled,
                        ]}
                        onPress={submitApplication}
                        disabled={!hasRequiredDocs || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                {stripeComplete ? 'Submit for Review' : 'Skip Stripe & Submit for Review'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {!hasRequiredDocs && (
                        <Text style={styles.submitBlockedText}>
                            Upload all required documents before submitting.
                        </Text>
                    )}

                    <Text style={styles.stepFooter}>Step 4 of 4</Text>
                    <View style={{ height: Math.max(insets.bottom, 20) }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scroll: { padding: moderateScale(15) },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: verticalScale(12) },
    loadingText: { color: '#64748b', fontSize: moderateScale(14) },

    // Stepper
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(20), marginBottom: verticalScale(10) },
    stepGroup: { alignItems: 'center', width: scale(65) },
    stepCircle: { width: moderateScale(28), height: moderateScale(28), borderRadius: moderateScale(14), backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(5), borderWidth: 1, borderColor: '#e2e8f0' },
    stepActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepCompleted: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepTextActive: { color: '#fff', fontSize: moderateScale(11), fontWeight: 'bold' },
    stepLabelActive: { fontSize: moderateScale(10), color: '#0d9488', fontWeight: 'bold' },
    stepLine: { width: scale(35), height: 1, backgroundColor: '#e2e8f0', marginHorizontal: -scale(8), zIndex: -1, alignSelf: 'center', marginTop: -verticalScale(18) },
    stepLineActive: { backgroundColor: '#0d9488' },

    // Card
    contentCard: { backgroundColor: '#fff', borderRadius: moderateScale(12), padding: moderateScale(20), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
    backButton: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
    mainTitle: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginBottom: verticalScale(16) },

    // Notice banner
    noticeBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fffbeb', borderRadius: moderateScale(10), padding: moderateScale(12), marginBottom: verticalScale(20), borderWidth: 1, borderColor: '#fde68a', gap: scale(8) },
    noticeText: { flex: 1, fontSize: moderateScale(12), color: '#92400e', lineHeight: 18 },

    // Sections
    section: { marginBottom: verticalScale(20), borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: verticalScale(16) },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) },
    sectionTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#334155' },
    editLink: { color: '#0d9488', fontWeight: 'bold', fontSize: moderateScale(13) },

    // Info rows
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    infoLabel: { fontSize: moderateScale(13), color: '#64748b' },
    infoValue: { fontSize: moderateScale(13), color: '#0f172a', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
    bioLabel: { fontSize: moderateScale(13), color: '#64748b', marginTop: verticalScale(4) },
    bioText: { fontSize: moderateScale(13), color: '#0f172a', fontStyle: 'italic', marginTop: verticalScale(4), lineHeight: 20 },

    // Doc rows
    docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(8), borderBottomWidth: 1, borderBottomColor: '#f8fafc', gap: scale(10) },
    docName: { flex: 1, fontSize: moderateScale(13), color: '#334155', fontWeight: '500' },
    statusBadge: { paddingHorizontal: scale(8), paddingVertical: verticalScale(3), borderRadius: moderateScale(20) },
    statusBadgeText: { fontSize: moderateScale(11), fontWeight: '700' },
    noDocsText: { fontSize: moderateScale(13), color: '#94a3b8', fontStyle: 'italic' },
    missingDocsWarning: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fef2f2', borderRadius: moderateScale(8), padding: moderateScale(10), marginTop: verticalScale(10), gap: scale(6), borderWidth: 1, borderColor: '#fecaca' },
    missingDocsText: { flex: 1, fontSize: moderateScale(12), color: '#dc2626', lineHeight: 18 },

    // Stripe optional
    stripeOptionalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: scale(8) },
    stripeOptionalText: { flex: 1, fontSize: moderateScale(13), color: '#64748b', lineHeight: 18, fontStyle: 'italic' },

    // Terms
    termsBox: { backgroundColor: '#f8fafc', padding: moderateScale(12), borderRadius: moderateScale(8), marginBottom: verticalScale(20) },
    termsText: { fontSize: moderateScale(12), color: '#64748b', textAlign: 'center', lineHeight: 18 },

    // Submit
    submitBtn: { backgroundColor: '#0d9488', padding: moderateScale(16), borderRadius: moderateScale(12), alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: 'bold' },
    btnDisabled: { opacity: 0.5 },
    submitBlockedText: { textAlign: 'center', color: '#ef4444', fontSize: moderateScale(11), marginTop: verticalScale(8) },
    stepFooter: { textAlign: 'center', color: '#94a3b8', fontSize: moderateScale(11), marginTop: verticalScale(20) },
});

export default ReviewScreen;