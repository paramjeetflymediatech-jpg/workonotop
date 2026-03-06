import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const BankLinkScreen = ({ navigation, route }) => {
    const { profile, profilePhoto, skills, documents } = route.params || {};
    const [stripeUrl, setStripeUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [webLoading, setWebLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    const openStripeOnboarding = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/provider/stripe-connect-link');
            if (res.url) {
                setStripeUrl(res.url);
            } else {
                throw new Error('No onboarding link returned');
            }
        } catch (err) {
            console.error('Stripe link error:', err);
            Alert.alert(
                'Stripe Connect',
                'Unable to open Stripe onboarding. Please try again or skip for now.',
                [
                    { text: 'Try Again', onPress: openStripeOnboarding },
                    { text: 'Skip for Now', onPress: handleSkip },
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Bank Linking?',
            'You can add your bank account later from your profile settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', onPress: submitApplication },
            ]
        );
    };

    const submitApplication = async () => {
        setLoading(true);
        try {
            // Submit the contractor profile to backend
            const formData = new FormData();
            formData.append('name', profile?.name || '');
            formData.append('phone', profile?.phone || '');
            formData.append('serviceArea', profile?.serviceArea || '');
            formData.append('bio', profile?.bio || '');
            formData.append('skills', JSON.stringify(skills || []));

            const res = await api.post('/api/provider/complete-profile', formData);
            navigation.navigate('PendingApproval');
        } catch (err) {
            console.error('Profile submission error:', err);
            // Still navigate to pending screen for now
            navigation.navigate('PendingApproval');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigationChange = (navState) => {
        // Detect when stripe redirects back
        const url = navState.url || '';
        if (url.includes('/stripe/callback') || url.includes('/stripe/refresh') || url.includes('success=true')) {
            setStripeUrl(null);
            setConnected(true);
        }
    };

    if (stripeUrl) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.webHeader}>
                    <TouchableOpacity onPress={() => setStripeUrl(null)} style={styles.closeBtn}>
                        <Text style={styles.closeText}>✕ Close</Text>
                    </TouchableOpacity>
                    <Text style={styles.webTitle}>Bank Account Setup</Text>
                </View>
                {webLoading && (
                    <View style={styles.webLoader}>
                        <ActivityIndicator size="large" color="#14b8a6" />
                    </View>
                )}
                <WebView
                    source={{ uri: stripeUrl }}
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => setWebLoading(false)}
                    onNavigationStateChange={handleNavigationChange}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Link Your Bank Account</Text>
                <Text style={styles.subtitle}>Step 5 of 5 — Get paid directly to your account</Text>

                {connected ? (
                    <View style={styles.successCard}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successText}>Bank account connected!</Text>
                    </View>
                ) : (
                    <View style={styles.stripeCard}>
                        <Text style={styles.stripeIcon}>🏦</Text>
                        <Text style={styles.stripeTitle}>Powered by Stripe</Text>
                        <Text style={styles.stripeDesc}>
                            We use Stripe to securely process payments. Your banking details are never stored on our servers.
                        </Text>
                        <View style={styles.features}>
                            {['256-bit encryption', 'Bank-level security', 'Instant payouts available'].map((f) => (
                                <Text key={f} style={styles.featureItem}>✓ {f}</Text>
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.stripeBtn, loading && styles.btnDisabled]}
                    onPress={connected ? submitApplication : openStripeOnboarding}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.stripeBtnText}>
                            {connected ? 'Submit Application →' : '🔗 Connect Bank Account'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip — Add bank account later</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: moderateScale(24) },
    webHeader: {
        flexDirection: 'row', alignItems: 'center', padding: moderateScale(16),
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    closeBtn: { padding: moderateScale(8) },
    closeText: { color: '#ef4444', fontWeight: '600', fontSize: moderateScale(15) },
    webTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: moderateScale(16), color: '#0f172a', marginRight: moderateScale(40) },
    webLoader: { position: 'absolute', top: '50%', left: '50%', zIndex: 10 },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(24),
    },
    backIcon: { fontSize: moderateScale(20), color: '#0f172a', fontWeight: 'bold' },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(32) },
    stripeCard: {
        backgroundColor: '#f8fafc', borderRadius: moderateScale(20),
        padding: moderateScale(24), alignItems: 'center', marginBottom: verticalScale(32),
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    stripeIcon: { fontSize: moderateScale(48), marginBottom: verticalScale(12) },
    stripeTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(8) },
    stripeDesc: { fontSize: moderateScale(14), color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: verticalScale(16) },
    features: { width: '100%' },
    featureItem: { color: '#10b981', fontSize: moderateScale(14), fontWeight: '600', marginVertical: verticalScale(3) },
    successCard: {
        backgroundColor: '#f0fdfa', borderRadius: moderateScale(20), padding: moderateScale(30),
        alignItems: 'center', marginBottom: verticalScale(32), borderWidth: 2, borderColor: '#14b8a6',
    },
    successIcon: { fontSize: moderateScale(48), marginBottom: verticalScale(8) },
    successText: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f766e' },
    stripeBtn: {
        backgroundColor: '#635bff', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    stripeBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
    skipBtn: { alignItems: 'center', marginTop: verticalScale(16) },
    skipText: { color: '#94a3b8', fontSize: moderateScale(14), textDecorationLine: 'underline' },
});

export default BankLinkScreen;
