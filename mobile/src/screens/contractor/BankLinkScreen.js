import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import PremiumAlert from '../../components/PremiumAlert';

const BankLinkScreen = ({ navigation, route }) => {
    const { profile, profilePhoto, skills, documents } = route.params || {};
    const { user, token, updateUser, refreshUser, logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [stripeUrl, setStripeUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [webLoading, setWebLoading] = useState(true);
    const isConnected = user?.stripe_onboarding_complete == 1 || user?.stripe_onboarding_complete === true || user?.stripe_onboarding_complete === '1';
    const [connected, setConnected] = useState(isConnected);
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
                // Extract accountId from URL if present
                let accountId = null;
                if (url.includes('account_id=')) {
                    const match = url.match(/account_id=([^&]+)/);
                    if (match) accountId = match[1];
                }

                console.log('🔄 [Stripe] Finalizing with Account ID:', accountId);

                // 1. Tell backend to verify/complete the Stripe setup
                await apiService.provider.onboarding.stripeComplete({ accountId }, token);

                // 2. Refresh entire user object from backend to get stripe_onboarding_complete status
                await refreshUser();
            } catch (err) {
                console.warn('Silent failure finalizing Stripe status:', err);
                // Fallback: at least try to refresh if stripeComplete failed but user might be updated
                await refreshUser();
            }

            // Auto navigate based on onboarding status
            if (Number(user?.onboarding_completed) === 1 || user?.status === 'active') {
                navigation.navigate('Main');
            } else {
                navigation.navigate('Review', { profile, documents, connected: true });
            }
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
            <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.mainTitle}>Bank Account</Text>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ef4444" />
                    </TouchableOpacity>
                </View>

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
                        ? ((Number(user?.onboarding_completed) === 1 || user?.status === 'active')
                            ? () => navigation.navigate('Main')
                            : () => navigation.navigate('Review', { profile, documents, connected: true }))
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

                {!connected && (
                    <TouchableOpacity
                        style={styles.skipBtn}
                        onPress={(Number(user?.onboarding_completed) === 1 || user?.status === 'active')
                            ? () => navigation.navigate('Main')
                            : () => navigation.navigate('Review', { profile, documents, connected: false })}
                        disabled={loading}
                    >
                        <Text style={styles.skipBtnText}>Skip — Add bank account later</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.mandatoryNotice}>
                    <Ionicons name="information-circle-outline" size={moderateScale(16)} color="#64748b" />
                    <Text style={styles.mandatoryText}>Stripe setup is recommended for receiving payments, but you can complete it after submission.</Text>
                </View>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    backButton: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center',
    },
    mainTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
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
    skipBtn: {
        marginTop: verticalScale(16),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
    },
    skipBtnText: {
        color: '#64748b',
        fontSize: moderateScale(15),
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    mandatoryNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(24),
        backgroundColor: '#f8fafc',
        padding: moderateScale(12),
        borderRadius: moderateScale(10),
    },
    mandatoryText: {
        color: '#64748b',
        fontSize: moderateScale(13),
        marginLeft: scale(8),
        fontStyle: 'italic',
        lineHeight: moderateScale(18),
        textAlign: 'center',
        flex: 1,
    },
});

export default BankLinkScreen;
