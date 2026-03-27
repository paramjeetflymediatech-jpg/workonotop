import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';

/**
 * RejectedScreen — shown when provider.status === 'rejected'.
 * Mirrors the web /provider/rejected page.
 *
 * The rejection reason can be passed via route.params?.reason,
 * or fetched from the user object.
 */
const RejectedScreen = ({ route }) => {
    const { logout, user } = useAuth();
    const reason = route.params?.reason || user?.rejection_reason || 'No specific reason provided.';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header card */}
                <View style={styles.headerCard}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="close-circle" size={moderateScale(36)} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Application Not Approved</Text>
                    <Text style={styles.headerSub}>WorkOnTop Pro Portal</Text>
                </View>

                <View style={styles.body}>
                    <Text style={styles.greeting}>
                        Hi <Text style={styles.name}>{user?.name || 'there'}</Text>, your application was reviewed but not approved at this time.
                    </Text>

                    {/* Reason box */}
                    <View style={styles.reasonSection}>
                        <Text style={styles.reasonLabel}>Reason for Rejection</Text>
                        <View style={styles.reasonBox}>
                            <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                    </View>

                    {/* Support note */}
                    <View style={styles.supportBox}>
                        <Ionicons name="mail-outline" size={moderateScale(16)} color="#94a3b8" />
                        <Text style={styles.supportText}>
                            If you believe this is an error, please contact{' '}
                            <Text style={styles.supportEmail}>support@workontop.com</Text>
                        </Text>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity style={styles.primaryBtn} onPress={logout}>
                        <Ionicons name="arrow-back" size={moderateScale(16)} color="#fff" style={{ marginRight: scale(8) }} />
                        <Text style={styles.primaryBtnText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff1f2' },
    scroll: { flexGrow: 1 },

    headerCard: {
        backgroundColor: '#dc2626',
        paddingVertical: verticalScale(40),
        paddingHorizontal: scale(24),
        alignItems: 'center',
    },
    iconCircle: {
        width: moderateScale(64),
        height: moderateScale(64),
        borderRadius: moderateScale(32),
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    headerTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSub: {
        fontSize: moderateScale(13),
        color: 'rgba(255,255,255,0.7)',
        marginTop: verticalScale(4),
    },

    body: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        marginTop: -verticalScale(12),
        padding: moderateScale(24),
    },

    greeting: {
        fontSize: moderateScale(15),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: verticalScale(24),
    },
    name: {
        fontWeight: 'bold',
        color: '#0f172a',
    },

    reasonSection: {
        backgroundColor: '#fef2f2',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    reasonLabel: {
        fontSize: moderateScale(11),
        fontWeight: 'bold',
        color: '#b91c1c',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: verticalScale(8),
    },
    reasonBox: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    reasonText: {
        fontSize: moderateScale(14),
        color: '#991b1b',
        lineHeight: 20,
    },

    supportBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(28),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: scale(10),
    },
    supportText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#64748b',
        lineHeight: 20,
    },
    supportEmail: {
        color: '#0d9488',
        fontWeight: '600',
    },

    primaryBtn: {
        backgroundColor: '#1e293b',
        borderRadius: moderateScale(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});

export default RejectedScreen;