import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale } from '../../utils/responsive';
import PremiumAlert from '../../components/PremiumAlert';

const BankLinkScreen = ({ navigation, route }) => {
    const { profile, profilePhoto, skills, documents } = route.params || {};
    const { user, token, updateUser } = useAuth();
    const [stripeUrl, setStripeUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [webLoading, setWebLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });

    const showPremiumAlert = (message, title = '', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    const openStripeOnboarding = async () => {
        setLoading(true);
        try {
            const refreshUrl = 'https://workonotop.com/stripe/refresh'; // Mock URLs for Stripe
            const returnUrl = 'https://workonotop.com/stripe/callback';

            const res = await apiService.provider.onboarding.createStripeAccount({
                refreshUrl,
                returnUrl
            }, token);

            if (res.success && res.onboardingUrl) {
                setStripeUrl(res.onboardingUrl);
            } else {
                throw new Error(res.message || 'No onboarding link returned');
            }
        } catch (err) {
            console.error('Stripe link error:', err);
            showPremiumAlert('Unable to open Stripe onboarding. Please try again or skip for now.', 'Stripe Connect');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        try {
            await updateUser({ onboarding_step: 5 });
            navigation.navigate('Review', { profile, documents, connected: false });
        } catch (err) {
            console.error('Skip state update error:', err);
            navigation.navigate('Review', { profile, documents, connected: false });
        }
    };

    const submitApplication = async () => {
        // ... (rest of the function remains similar but ensure it's used correctly)
    }

    const handleNavigationChange = async (navState) => {
        // Detect when stripe redirects back
        const url = navState.url || '';
        if (
            url.includes('/stripe/callback') || 
            url.includes('/stripe/refresh') || 
            url.includes('success=true') ||
            url.includes('stripe_complete=true') ||
            url.includes('onboarding?step=4')
        ) {
            setStripeUrl(null);
            setConnected(true);
            
            try {
                // Attempt to call stripeComplete to update backend status
                await apiService.provider.onboarding.stripeComplete({}, token);
                await updateUser({ onboarding_step: 5 });
            } catch (err) {
                console.warn('Silent failure updating stripe status:', err);
                await updateUser({ onboarding_step: 5 });
            }

            // Auto navigate to review after connection
            navigation.navigate('Review', { profile, documents, connected: true });
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
                <Text style={styles.subtitle}>Step 3 of 4 — Get paid directly to your account</Text>

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
                    onPress={connected 
                        ? () => navigation.navigate('Review', { profile, documents, connected: true }) 
                        : openStripeOnboarding}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.stripeBtnText}>
                            {connected ? 'Continue to Review →' : '🔗 Connect Bank Account'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip — Add bank account later</Text>
                </TouchableOpacity>
            </View>

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
