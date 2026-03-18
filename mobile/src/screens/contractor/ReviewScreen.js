import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, Image, ActivityIndicator
} from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const ReviewScreen = ({ navigation, route }) => {
    const { profile, documents, connected } = route.params || {};
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const submitApplication = async () => {
        setLoading(true);
        try {
            const profilePayload = {
                bio: profile?.bio || '',
                specialty: profile?.primarySpecialty || '',
                experience_years: parseInt(profile?.yearsExperience || '1'),
                city: profile?.city || '',
                location: profile?.businessAddress || '',
                service_areas: profile?.serviceAreas || [],
                skills: profile?.skills || []
            };

            console.log('📦 Submitting Profile Payload:', profilePayload);

            // 1. Submit Profile Data
            const profRes = await api.post('/api/provider/onboarding/profile', profilePayload);
            console.log('✅ Profile Update Response:', profRes);

            // 2. Submit completion
            console.log('🚀 Calling Onboarding Complete...');
            const res = await api.post('/api/provider/onboarding/complete');
            console.log('✅ Completion Response:', res);

            if (res.success) {
                // Update local auth context
                if (updateUser) {
                    await updateUser({ onboarding_completed: 1, status: 'pending' });
                }
                // Navigator will auto-switch to PendingApproval stack
            } else {
                throw new Error(res.message || 'Completion failed');
            }
        } catch (err) {
            console.error('Final submission error:', err);
            Alert.alert('Error', err.message || 'Failed to complete onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
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
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Text style={styles.stepTextActive}>✓</Text>
                </View>
                <Text style={styles.stepLabelActive}>Docs</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.stepGroup}>
                <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Text style={styles.stepTextActive}>✓</Text>
                </View>
                <Text style={styles.stepLabelActive}>Payment</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.stepGroup}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                    <Text style={styles.stepTextActive}>4</Text>
                </View>
                <Text style={styles.stepLabelActive}>Review</Text>
            </View>
        </View>
    );

    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Stepper />

                <View style={styles.contentCard}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={moderateScale(24)} color="#0d9488" />
                        </TouchableOpacity>
                        <Text style={styles.mainTitle}>Final Review</Text>
                    </View>
                    <Text style={styles.subtitle}>Please check your details before submitting</Text>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <InfoRow label="Specialty" value={profile?.primarySpecialty} />
                        <InfoRow label="Experience" value={`${profile?.yearsExperience} years`} />
                        <InfoRow label="City" value={profile?.city} />
                        <Text style={styles.bioLabel}>Bio:</Text>
                        <Text style={styles.bioText} numberOfLines={3}>{profile?.bio}</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Documents</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('DocumentUpload')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.docStatusRow}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.docStatusText}>ID Proof & Trade License uploaded</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Payment Settings</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('BankLink')}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.docStatusRow}>
                            <Ionicons
                                name={connected ? "checkmark-circle" : "alert-circle"}
                                size={20}
                                color={connected ? "#10b981" : "#f59e0b"}
                            />
                            <Text style={styles.docStatusText}>
                                {connected ? 'Bank account linked with Stripe' : 'Bank linking skipped (Add later)'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.termsBox}>
                        <Text style={styles.termsText}>
                            By submitting, you agree to our Service Provider Terms and confirm that the information provided is accurate.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.btnDisabled]}
                        onPress={submitApplication}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Submit Application</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.stepFooter}>Step 4 of 4</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scroll: { padding: moderateScale(15) },
    stepperContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: verticalScale(20), marginBottom: verticalScale(10),
    },
    stepGroup: { alignItems: 'center', width: scale(65) },
    stepCircle: {
        width: moderateScale(28), height: moderateScale(28), borderRadius: moderateScale(14),
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
        marginBottom: verticalScale(5), borderWidth: 1, borderColor: '#e2e8f0',
    },
    stepActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepCompleted: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepTextActive: { color: '#fff', fontSize: moderateScale(11), fontWeight: 'bold' },
    stepLabelActive: { fontSize: moderateScale(10), color: '#0d9488', fontWeight: 'bold' },
    stepLine: { width: scale(35), height: 1, backgroundColor: '#e2e8f0', marginHorizontal: -scale(8), zIndex: -1, alignSelf: 'center', marginTop: -verticalScale(18) },
    stepLineActive: { backgroundColor: '#0d9488' },
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
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginBottom: verticalScale(24) },
    section: { marginBottom: verticalScale(24), borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: verticalScale(16) },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) },
    sectionTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#334155' },
    editLink: { color: '#0d9488', fontWeight: 'bold', fontSize: moderateScale(13) },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    infoLabel: { fontSize: moderateScale(14), color: '#64748b' },
    infoValue: { fontSize: moderateScale(14), color: '#0f172a', fontWeight: '500' },
    bioLabel: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4) },
    bioText: { fontSize: moderateScale(14), color: '#0f172a', fontStyle: 'italic', marginTop: verticalScale(4) },
    docStatusRow: { flexDirection: 'row', alignItems: 'center' },
    docStatusText: { marginLeft: scale(8), fontSize: moderateScale(14), color: '#475569' },
    termsBox: { backgroundColor: '#f8fafc', padding: moderateScale(12), borderRadius: moderateScale(8), marginBottom: verticalScale(24) },
    termsText: { fontSize: moderateScale(12), color: '#64748b', textAlign: 'center', lineHeight: 18 },
    submitBtn: { backgroundColor: '#0d9488', padding: moderateScale(16), borderRadius: moderateScale(12), alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
    btnDisabled: { opacity: 0.6 },
    stepFooter: { textAlign: 'center', color: '#94a3b8', fontSize: moderateScale(11), marginTop: verticalScale(20) }
});

export default ReviewScreen;
