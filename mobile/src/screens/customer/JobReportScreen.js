import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, ActivityIndicator, Alert, Image
} from 'react-native';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const JobReportScreen = ({ navigation, route }) => {
    const { bookingId } = route.params || {};
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const res = await api.get(`/api/customer/bookings/${bookingId}`);
                setBooking(res.data || res.booking || null);
            } catch (err) {
                console.error('Job report load error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (bookingId) loadBooking();
    }, [bookingId]);

    const handleApprove = async () => {
        Alert.alert('Approve & Pay?', 'This will release the payment to the provider.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve & Pay', onPress: async () => {
                    setActionLoading('approve');
                    try {
                        await api.post('/api/job/approve', { booking_id: bookingId });
                        Alert.alert('Payment Released!', 'Great! The job is now completed and payment sent.', [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    } catch (err) {
                        Alert.alert('Error', 'Failed to approve. Please try again.');
                    } finally {
                        setActionLoading(null);
                    }
                }
            }
        ]);
    };

    const handleDispute = async () => {
        Alert.alert('Open Dispute?', 'Our team will review your case within 24 hours.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Open Dispute', style: 'destructive', onPress: async () => {
                    setActionLoading('dispute');
                    try {
                        await api.post('/api/job/dispute', { booking_id: bookingId, reason: 'Customer disputed' });
                        Alert.alert('Dispute Opened', 'Our team will contact you within 24 hours.', [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    } catch (err) {
                        Alert.alert('Error', 'Failed to open dispute. Please try again.');
                    } finally {
                        setActionLoading(null);
                    }
                }
            }
        ]);
    };

    if (loading) return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#14b8a6" /></View>;

    if (!booking) return (
        <SafeAreaView style={styles.container}>
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Job report not found.</Text>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Job Report</Text>
                <Text style={styles.subtitle}>{booking.service_name}</Text>

                {/* Before Photos */}
                {booking.before_photos?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📸 Before Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {booking.before_photos.map((photo, i) => (
                                <Image key={i} source={{ uri: photo }} style={styles.reportPhoto} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* After Photos */}
                {booking.after_photos?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>✅ After Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {booking.after_photos.map((photo, i) => (
                                <Image key={i} source={{ uri: photo }} style={styles.reportPhoto} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Work Summary</Text>
                    <Text style={styles.summaryText}>{booking.summary || 'No summary provided.'}</Text>
                </View>

                {/* Recommendations */}
                {booking.recommendations && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💡 Future Recommendations</Text>
                        <Text style={styles.summaryText}>{booking.recommendations}</Text>
                    </View>
                )}

                {/* Time */}
                <View style={styles.timeRow}>
                    <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Start Time</Text>
                        <Text style={styles.timeValue}>{booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}</Text>
                    </View>
                    <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>End Time</Text>
                        <Text style={styles.timeValue}>{booking.end_time ? new Date(booking.end_time).toLocaleString() : 'N/A'}</Text>
                    </View>
                </View>

                {/* Actions */}
                {booking.status === 'awaiting_approval' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.approveBtn, actionLoading === 'approve' && styles.btnDisabled]}
                            onPress={handleApprove}
                            disabled={!!actionLoading}
                        >
                            {actionLoading === 'approve' ? <ActivityIndicator color="#fff" /> : <Text style={styles.approveBtnText}>✓ Approve & Release Payment</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.disputeBtn, actionLoading === 'dispute' && styles.btnDisabled]}
                            onPress={handleDispute}
                            disabled={!!actionLoading}
                        >
                            {actionLoading === 'dispute' ? <ActivityIndicator color="#ef4444" /> : <Text style={styles.disputeBtnText}>⚠ Open Dispute</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#94a3b8', fontSize: moderateScale(16) },
    scroll: { padding: moderateScale(24), paddingBottom: 40 },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16),
    },
    backIcon: { fontSize: moderateScale(20), color: '#0f172a', fontWeight: 'bold' },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(15), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(24) },
    section: {
        backgroundColor: '#f8fafc', borderRadius: moderateScale(16),
        padding: moderateScale(16), marginBottom: verticalScale(16),
    },
    sectionTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(10) },
    reportPhoto: {
        width: moderateScale(140), height: moderateScale(100),
        borderRadius: moderateScale(10), marginRight: 10, resizeMode: 'cover'
    },
    summaryText: { fontSize: moderateScale(14), color: '#475569', lineHeight: 22 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(24) },
    timeItem: { flex: 1, backgroundColor: '#f8fafc', borderRadius: moderateScale(12), padding: moderateScale(14), marginHorizontal: 4 },
    timeLabel: { fontSize: moderateScale(12), color: '#94a3b8', fontWeight: '600' },
    timeValue: { fontSize: moderateScale(13), color: '#0f172a', fontWeight: 'bold', marginTop: verticalScale(4) },
    actions: { gap: 12 },
    approveBtn: {
        backgroundColor: '#10b981', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center',
    },
    approveBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
    disputeBtn: {
        backgroundColor: '#fff', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center',
        borderWidth: 2, borderColor: '#ef4444',
    },
    disputeBtnText: { color: '#ef4444', fontSize: moderateScale(16), fontWeight: 'bold' },
    btnDisabled: { opacity: 0.6 },
});

export default JobReportScreen;
