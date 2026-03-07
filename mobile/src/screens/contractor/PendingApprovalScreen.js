import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale } from '../../utils/responsive';

const PendingApprovalScreen = ({ navigation }) => {
    const { logout, updateUser } = useAuth();
    const [status, setStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [checkingCount, setCheckingCount] = useState(0);

    const checkStatus = async () => {
        try {
            const res = await api.get('/api/provider/status');
            const providerStatus = (res.status || res.data?.status || 'pending').toLowerCase();

            if (providerStatus !== status) {
                setStatus(providerStatus);
                // If they are now approved, update AuthContext to allow access to Main
                if (providerStatus === 'approved' && updateUser) {
                    await updateUser({ status: 'approved' });
                }
            }
        } catch (err) {
            console.error('Status check failed:', err);
            setStatus('pending');
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
            case 'approved':
                return {
                    icon: '🎉', color: '#10b981', bgColor: '#f0fdf4',
                    title: "You're Approved!", borderColor: '#10b981',
                    desc: 'Congratulations! Your application has been approved. You can now start accepting jobs.',
                    actionText: 'Go to Dashboard', action: () => navigation.replace('Main'),
                };
            case 'rejected':
                return {
                    icon: '❌', color: '#ef4444', bgColor: '#fef2f2',
                    title: 'Application Rejected', borderColor: '#ef4444',
                    desc: 'Unfortunately, your application was not approved. Please contact support for more information.',
                    actionText: 'Contact Support', action: () => { },
                };
            default:
                return {
                    icon: '⏳', color: '#f59e0b', bgColor: '#fffbeb',
                    title: 'Application Pending', borderColor: '#f59e0b',
                    desc: 'Our team is reviewing your application. This usually takes 1-2 business days. We will notify you by email.',
                    actionText: 'Refresh Status', action: handleRefresh,
                };
        }
    };

    const cfg = getStatusConfig();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }]}>
                    <Text style={styles.statusIcon}>{cfg.icon}</Text>
                    <Text style={[styles.statusTitle, { color: cfg.color }]}>{cfg.title}</Text>
                    <Text style={styles.statusDesc}>{cfg.desc}</Text>
                </View>

                {status === 'pending' && (
                    <View style={styles.stepsCard}>
                        <Text style={styles.stepsTitle}>What happens next?</Text>
                        {[
                            { step: '1', text: 'Our team reviews your documents', done: true },
                            { step: '2', text: 'Background check (if required)', done: false },
                            { step: '3', text: 'Approval email sent to you', done: false },
                            { step: '4', text: 'Start accepting jobs!', done: false },
                        ].map((item) => (
                            <View key={item.step} style={styles.stepRow}>
                                <View style={[styles.stepBall, item.done && styles.stepBallDone]}>
                                    <Text style={styles.stepNum}>{item.done ? '✓' : item.step}</Text>
                                </View>
                                <Text style={styles.stepText}>{item.text}</Text>
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
    stepNum: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(13) },
    stepText: { fontSize: moderateScale(14), color: '#475569', flex: 1 },
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
