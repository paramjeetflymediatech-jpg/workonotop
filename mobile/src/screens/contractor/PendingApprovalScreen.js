import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, ScrollView,
    Animated, Easing
} from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale } from '../../utils/responsive';

const PendingApprovalScreen = ({ navigation }) => {
    const { logout, updateUser, user } = useAuth();
    const [status, setStatus] = useState('pending');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingCount, setCheckingCount] = useState(0);
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    const startRotation = () => {
        rotateAnim.setValue(0);
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    React.useEffect(() => {
        if (status === 'pending') {
            startRotation();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [status]);

    const checkStatus = async () => {
        try {
            const res = await api.get('/api/provider/me');
            if (res.success && res.provider) {
                const prov = res.provider;
                setProvider(prov);
                const providerStatus = (prov.status || 'pending').toLowerCase();
                setStatus(providerStatus);

                if (providerStatus === 'active' && updateUser) {
                    await updateUser({ ...prov, status: 'active' });
                }
            }
        } catch (err) {
            console.error('Status check failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            setCheckingCount(c => c + 1);
            checkStatus();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        checkStatus();
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'active':
            case 'approved':
                return {
                    icon: '🎉', color: '#10b981', bgColor: '#f0fdf4',
                    title: "You're Approved!", borderColor: '#10b981',
                    desc: 'Congratulations! Your application has been approved. You can now start accepting jobs.',
                    actionText: 'Go to Dashboard', action: () => { /* Handled by state change */ },
                };
            case 'rejected':
                return {
                    icon: '❌', color: '#ef4444', bgColor: '#fef2f2',
                    title: 'Application Rejected', borderColor: '#ef4444',
                    desc: 'Unfortunately, your application was not approved. Please contact support for more information.',
                    actionText: 'Contact Support', action: () => { },
                };
            case 'suspended':
                return {
                    icon: '🚫', color: '#6b7280', bgColor: '#f3f4f6',
                    title: 'Account Suspended', borderColor: '#6b7280',
                    desc: 'Your account has been suspended. Please contact administration for further details.',
                    actionText: 'Contact Support', action: () => { },
                };
            default:
                return {
                    icon: '⏳', color: '#f59e0b', bgColor: '#fffbeb',
                    title: 'Application Pending', borderColor: '#f59e0b',
                    desc: "Our team is reviewing your application. This usually takes 24–48 hours. We'll notify you by email.",
                    actionText: 'Refresh Status', action: handleRefresh,
                };
        }
    };

    const cfg = getStatusConfig();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }]}>
                    <Animated.View style={{
                        transform: [{
                            rotate: status === 'pending' ? rotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg']
                            }) : '0deg'
                        }]
                    }}>
                        <Text style={styles.statusIcon}>{cfg.icon}</Text>
                    </Animated.View>
                    <Text style={[styles.statusTitle, { color: cfg.color }]}>{cfg.title}</Text>
                    <Text style={styles.statusDesc}>{cfg.desc}</Text>
                </View>

                {['pending', 'inactive'].includes(status) && (
                    <View style={styles.stepsCard}>
                        <Text style={styles.stepsTitle}>Application Progress</Text>
                        {[
                            { label: 'Email Verified', desc: 'Your email has been confirmed', done: true },
                            { label: 'Profile Completed', desc: 'Your information has been saved', done: true },
                            { label: 'Documents Uploaded', desc: 'Documents submitted for review', done: true },
                            {
                                label: 'Payment Setup',
                                desc: (provider?.stripe_onboarding_complete == 1 || provider?.stripe_onboarding_complete === true || provider?.stripe_onboarding_complete === '1')
                                    ? 'Stripe account connected'
                                    : 'Stripe setup — recommended for payouts',
                                done: (provider?.stripe_onboarding_complete == 1 || provider?.stripe_onboarding_complete === true || provider?.stripe_onboarding_complete === '1'),
                                skipped: !(provider?.stripe_onboarding_complete == 1 || provider?.stripe_onboarding_complete === true || provider?.stripe_onboarding_complete === '1'),
                            },
                            { label: 'Admin Review', desc: 'Application under review', done: false, current: true },
                        ].map((s, i) => (
                            <View key={i} style={styles.stepRow}>
                                <View style={[
                                    styles.stepBall, 
                                    s.done && styles.stepBallDone,
                                    s.current && styles.stepBallCurrent,
                                    s.skipped && styles.stepBallSkipped
                                ]}>
                                    <Text style={styles.stepNum}>{s.done ? '✓' : s.skipped ? '!' : (i + 1)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.stepText, s.current && styles.stepTextCurrent]}>{s.label}</Text>
                                    <Text style={styles.stepSubText}>{s.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
  
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: cfg.color }, loading && styles.btnDisabled]}
                    onPress={cfg.action}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.actionText}>{cfg.actionText}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { padding: moderateScale(24), paddingBottom: 40 },
    card: {
        borderRadius: moderateScale(24), padding: moderateScale(30),
        alignItems: 'center', marginBottom: verticalScale(24),
        borderWidth: 2,
    },
    statusIcon: { fontSize: moderateScale(64), marginBottom: verticalScale(16) },
    statusTitle: { fontSize: moderateScale(24), fontWeight: 'bold', marginBottom: verticalScale(12) },
    statusDesc: { fontSize: moderateScale(15), color: '#475569', textAlign: 'center', lineHeight: 24 },
    stepsCard: {
        backgroundColor: '#fff', borderRadius: moderateScale(20),
        padding: moderateScale(20), marginBottom: verticalScale(24),
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4,
    },
    stepsTitle: { fontSize: moderateScale(17), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(16) },
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(14) },
    stepBall: {
        width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(16),
        backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
        marginRight: moderateScale(14),
    },
    stepBallDone: { backgroundColor: '#10b981' },
    stepBallCurrent: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#f59e0b' },
    stepBallSkipped: { backgroundColor: '#fff7ed' },
    stepNum: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(13) },
    stepNumCurrent: { color: '#f59e0b' },
    stepText: { fontSize: moderateScale(14), color: '#475569', fontWeight: '500' },
    stepTextCurrent: { color: '#b45309', fontWeight: 'bold' },
    stepSubText: { fontSize: moderateScale(11), color: '#94a3b8', marginTop: 2 },
    actionBtn: {
        padding: moderateScale(18), borderRadius: moderateScale(16),
        alignItems: 'center', marginBottom: verticalScale(12),
    },
    btnDisabled: { opacity: 0.6 },
    actionText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
    logoutBtn: { alignItems: 'center', padding: moderateScale(12) },
    logoutText: { color: '#94a3b8', fontSize: moderateScale(14), textDecorationLine: 'underline' },
});

export default PendingApprovalScreen;
