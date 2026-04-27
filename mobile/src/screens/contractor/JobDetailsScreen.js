import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, StatusBar, Dimensions, RefreshControl, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';
import { API_BASE_URL } from '../../config';
import JobPhotoUpload from '../../components/JobPhotoUpload';
import TimeTracker from '../../components/TimeTracker';

const { width } = Dimensions.get('window');

const PURPLE_DARK = '#6b21a8';
const TEAL_DARK = '#15843E';

const JobDetailsScreen = ({ navigation, route }) => {
    const { job: initialJob } = route.params || {};
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [job, setJob] = useState(initialJob);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(true);
    const [photos, setPhotos] = useState({ before: [], after: [] });
    
    // Viewer states
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openViewer = (uri) => {
        setSelectedImage(uri);
        setViewerVisible(true);
    };

    const fetchPhotos = useCallback(async () => {
        try {
            const res = await api.get(`/api/provider/jobs/photos?booking_id=${job.id}`);
            if (res.success) setPhotos(res.data);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    }, [job.id]);

    const fetchLatestJob = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const fetchPromises = [
                api.get(`/api/provider/jobs/${job.id}`),
                api.get('/api/provider/me')
            ];

            // Only fetch photos if the job is assigned to this provider
            const isAssignedToMe = job?.provider_id === user?.id;
            const isAssignedStatus = ['confirmed', 'in_progress', 'awaiting_approval', 'completed'].includes(job?.status);

            if (isAssignedToMe || isAssignedStatus) {
                fetchPromises.push(fetchPhotos());
            }

            const [res, provRes] = await Promise.all(fetchPromises);

            if (res.success && res.data) {
                setJob(res.data);
            }
            if (provRes.success) {
                setStripeConnected(provRes.provider?.stripe_onboarding_complete || false);
            }
        } catch (err) {
            console.error('Error re-fetching job details:', err);
        } finally {
            if (!isRefresh) setLoading(false);
            setRefreshing(false);
        }
    }, [job?.id, fetchPhotos]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLatestJob(true);
    };

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const unsubscribe = navigation.addListener('focus', () => {
            fetchLatestJob();
        });
        return unsubscribe;
    }, [navigation, fetchLatestJob]);

    const handleAcceptJob = async () => {
        if (!stripeConnected) {
            Alert.alert('Stripe Not Connected', 'You need to connect your Stripe account before you can accept jobs.', [
                { text: 'Later', style: 'cancel' },
                { text: 'Connect Now', onPress: () => navigation.navigate('BankLink') }
            ]);
            return;
        }

        const amount = parseFloat(job.display_amount ?? job.provider_amount ?? 0);
        const otRate = parseFloat(job.pricing?.overtime_rate || 0);
        const hasOvertime = otRate > 0;

        Alert.alert(
            'Accept this Job?',
            `This job will be assigned to you immediately.\n\nGuaranteed earnings: $${amount.toFixed(2)}${hasOvertime ? '\n\nUp to 2hrs overtime available at $' + otRate.toFixed(2) + '/hr' : ''}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm Accept', onPress: async () => {
                        setLoading(true);
                        try {
                            const res = await api.post('/api/provider/available-jobs', { booking_id: job.id });
                            if (res.success) {
                                setJob(prev => ({
                                    ...prev,
                                    status: 'confirmed',
                                    provider_id: user?.id,
                                    provider_name: user?.name,
                                    is_my_job: true
                                }));
                                Alert.alert('Success', '🎉 Job accepted! Check your schedule in "My Jobs".');
                                setTimeout(() => navigation.navigate('MyJobs'), 1000);
                            } else {
                                Alert.alert('Error', res.message || 'Failed to accept job.');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to accept job. It may have been taken.');
                        } finally {
                            setLoading(false);
                        }
                    }
                },
            ]
        );
    };

    const DetailItem = ({ icon, label, value, color = "#15843E" }) => (
        <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
            </View>
        </View>
    );

    const PriceRow = ({ label, value, isTotal = false, color = '#0f172a', subValue }) => (
        <View style={[styles.priceRow, isTotal && styles.totalRow]}>
            <View>
                <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>{label}</Text>
                {subValue && <Text style={styles.priceSubValue}>{subValue}</Text>}
            </View>
            <Text style={[styles.priceValue, isTotal && styles.totalValue, { color }]}>{value}</Text>
        </View>
    );

    if (!job) return null;

    const basePrice = parseFloat(job.service_price || job.pricing?.base_price || 0);
    const commPct = parseFloat(job.commission_percent ?? job.pricing?.commission_percent ?? 0);
    const otRate = parseFloat(job.additional_price ?? job.pricing?.overtime_rate ?? 0);
    const dur = job.service_duration || job.pricing?.duration_minutes || 60;
    const commAmt = basePrice * (commPct / 100);
    const baseEarnings = basePrice - commAmt;
    const netOT = otRate * (1 - commPct / 100);
    const hasOvertime = otRate > 0;
    const earnings = typeof job.display_amount === 'string'
        ? parseFloat(job.display_amount.replace(/[^\d.-]/g, ''))
        : (parseFloat(job.display_amount ?? job.provider_amount ?? baseEarnings));

    const headerColor = hasOvertime ? TEAL_DARK : TEAL_DARK;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#15843E" />}
            >
                {/* Premium Header */}
                <View style={[styles.premiumHeader, { backgroundColor: headerColor, paddingTop: Math.max(insets.top, 20) }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Chat', {
                                bookingId: job.id,
                                bookingNumber: job.booking_number || job.id,
                                role: 'provider',
                                otherPartyName: job.customer_first_name ? `${job.customer_first_name} ${job.customer_last_name || ''}`.trim() : 'Customer',
                            })}
                            style={[styles.headerBtn, job.status === 'pending' && { opacity: 0.3 }]}
                            disabled={job.status === 'pending'}
                        >
                            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerBody}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerCategory}>{job.category_name?.toUpperCase()}</Text>
                            <Text style={styles.headerTitle}>{job.service_name}</Text>
                            <Text style={styles.headerBookingId}>#{job.booking_number || `BK-${job.id}`}</Text>
                        </View>
                        <View style={styles.headerEarnings}>
                            <Text style={styles.earningsLabelTop}>YOU EARN</Text>
                            <Text style={styles.earningsValueTop}>${earnings.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.headerBadges}>
                        <View style={styles.hBadge}>
                            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.hBadgeText}>{dur} min</Text>
                        </View>
                        {hasOvertime && (
                            <View style={[styles.hBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.hBadgeText}>⏰ +${netOT.toFixed(2)}/hr overtime</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Assigned Job Workflow */}
                    {['confirmed', 'in_progress', 'awaiting_approval', 'completed'].includes(job.status) && (
                        <View style={styles.workflowSection}>
                            {/* Step Progress Visual */}
                            <View style={styles.stepperContainer}>
                                {[
                                    { id: 1, label: 'Before', done: photos.before.length > 0 },
                                    { id: 2, label: 'Work', done: job.status === 'awaiting_approval' || job.status === 'completed' },
                                    { id: 3, label: 'After', done: photos.after.length > 0 },
                                    { id: 4, label: 'Done', done: job.status === 'completed' }
                                ].map((step, index, arr) => (
                                    <React.Fragment key={step.id}>
                                        <View style={styles.stepItem}>
                                            <View style={[styles.stepCircle, step.done && styles.stepCircleDone]}>
                                                {step.done ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={styles.stepNum}>{step.id}</Text>}
                                            </View>
                                            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
                                        </View>
                                        {index < arr.length - 1 && <View style={[styles.stepLine, step.done && styles.stepLineDone]} />}
                                    </React.Fragment>
                                ))}
                            </View>

                            {/* Phase 1: Before Photos */}
                            {job.status === 'confirmed' && photos.before.length === 0 && (
                                <View style={styles.activePhase}>
                                    <JobPhotoUpload
                                        bookingId={job.id}
                                        photoType="before"
                                        onUploadComplete={fetchPhotos}
                                    />
                                </View>
                            )}

                            {/* Phase 2: Timer & Job Management */}
                            {['confirmed', 'in_progress', 'awaiting_approval', 'completed'].includes(job.status) && (photos.before.length > 0 || job.status !== 'confirmed') && (
                                <View style={styles.activePhase}>
                                    <TimeTracker
                                        bookingId={job.id}
                                        standardDuration={dur}
                                        overtimeRate={otRate}
                                        hasBeforePhotos={photos.before.length > 0}
                                        hasAfterPhotos={photos.after.length > 0}
                                        onStart={fetchLatestJob}
                                        onComplete={fetchLatestJob}
                                    />
                                </View>
                            )}

                            {/* Phase 3: After Photos (Only when in progress) */}
                            {job.status === 'in_progress' && (
                                <View style={[styles.activePhase, { marginTop: 16 }]}>
                                    <JobPhotoUpload
                                        bookingId={job.id}
                                        photoType="after"
                                        onUploadComplete={fetchPhotos}
                                    />
                                </View>
                            )}

                            {/* History: Before Photos Display */}
                            {photos.before.length > 0 && (
                                <View style={styles.historySection}>
                                    <Text style={styles.historyTitle}>Before Photos ({photos.before.length})</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                        {photos.before.map((p, i) => {
                                            const rawUrl = p.photo_url || p.url || '';
                                            const uri = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                                            return (
                                                <TouchableOpacity key={i} onPress={() => openViewer(uri)}>
                                                    <Image source={{ uri }} style={styles.historyPhoto} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
 
                            {/* History: After Photos Display */}
                            {photos.after.length > 0 && (
                                <View style={styles.historySection}>
                                    <Text style={styles.historyTitle}>After Photos ({photos.after.length})</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                        {photos.after.map((p, i) => {
                                            const rawUrl = p.photo_url || p.url || '';
                                            const uri = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                                            return (
                                                <TouchableOpacity key={i} onPress={() => openViewer(uri)}>
                                                    <Image source={{ uri }} style={styles.historyPhoto} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                    {/* Status Banner */}
                    {job.is_my_job && (
                        <View style={styles.successBanner}>
                            <Ionicons name="checkmark-circle" size={20} color={TEAL_DARK} />
                            <Text style={styles.successBannerText}>You have accepted this job!</Text>
                        </View>
                    )}

                    {/* Financial Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 Payment Breakdown</Text>
                        <View style={styles.detailsCard}>
                            <PriceRow label="Your Earnings" value={`$${baseEarnings.toFixed(2)}`} isTotal color={TEAL_DARK} />

                            {hasOvertime && (
                                <View style={styles.otBreakdown}>
                                    <View style={styles.otDivider} />
                                    <PriceRow label="Overtime Pay (Net)" value={`+$${netOT.toFixed(2)}/hr`} color={TEAL_DARK} />

                                    <View style={styles.potentialCard}>
                                        <Text style={styles.potentialTitle}>With overtime, you could earn:</Text>
                                        <View style={styles.pBoxRow}>
                                            <View style={styles.pBox}>
                                                <Text style={styles.pBoxLabel}>1hr OT</Text>
                                                <Text style={styles.pBoxValue}>${(baseEarnings + netOT).toFixed(2)}</Text>
                                            </View>
                                            <View style={[styles.pBox, { borderLeftWidth: 1, borderLeftColor: '#ddd6fe' }]}>
                                                <Text style={styles.pBoxLabel}>2hr OT</Text>
                                                <Text style={styles.pBoxValue}>${(baseEarnings + netOT * 2).toFixed(2)}</Text>
                                            </View>
                                        </View>
                                        {/* <Text style={styles.pBoxFootnote}>All amounts after {commPct}% commission</Text> */}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Schedule */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Schedule</Text>
                        <View style={styles.detailsCard}>
                            <DetailItem
                                icon="calendar-outline"
                                label="Job Date"
                                color={TEAL_DARK}
                                value={new Date(job.job_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            />
                            <DetailItem
                                icon="time-outline"
                                label="Time Slot(s)"
                                color={TEAL_DARK}
                                value={Array.isArray(job.job_time_slot) ? job.job_time_slot.join(', ') : (job.job_time_slot || 'Flexible')}
                            />
                            {job.timing_constraints && (
                                <View style={styles.timingNote}>
                                    <Text style={styles.timingNoteLabel}>Timing Notes:</Text>
                                    <Text style={styles.timingNoteVal}>{job.timing_constraints}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Location & Access</Text>
                        <View style={styles.detailsCard}>
                            <View style={styles.addressBox}>
                                <Text style={styles.addressLine}>{job.address_line1}</Text>
                                {job.address_line2 ? <Text style={styles.addressSub}>{job.address_line2}</Text> : null}
                                <Text style={styles.addressSub}>{[job.city, job.postal_code].filter(Boolean).join(', ')}</Text>
                            </View>

                            <View style={styles.accessGrid}>
                                {[
                                    { id: 'p', icon: 'car', label: 'Parking', active: !!job.parking_access, },
                                    { id: 'e', icon: 'business', label: 'Elevator', active: !!job.elevator_access, },
                                    { id: 'a', icon: 'paw', label: 'Pets', active: !!job.has_pets, },
                                ].map((item) => (
                                    <View key={item.id} style={[styles.aBadge, item.active ? { backgroundColor: item.color + '15', borderColor: item.color + '30' } : styles.aBadgeDisabled]}>
                                        <Ionicons name={item.icon} size={16} color={item.active ? item.color : '#94a3b8'} />
                                        <Text style={[styles.aBadgeText, item.active ? { color: TEAL_DARK } : { color: '#94a3b8' }]}>
                                            {item.label} {item.active ? '✓' : '—'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Details */}
                    {job.job_description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📝 Job Description</Text>
                            <View style={styles.detailsCard}>
                                <Text style={styles.descText}>{job.job_description}</Text>
                            </View>
                        </View>
                    )}

                    {job.instructions && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💡 Special Instructions</Text>
                            <View style={styles.detailsCard}>
                                <View style={styles.instructionRow}>
                                    <Ionicons name="bulb-outline" size={18} color="#0d9488" />
                                    <Text style={styles.instructionText}>{job.instructions}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Photos */}
                    {job.photos?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📷 Job Photos ({job.photos.length})</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {job.photos.map((photo, i) => {
                                    const uri = photo.startsWith('http') ? photo : `${API_BASE_URL}${photo}`;
                                    return (
                                        <TouchableOpacity 
                                            key={i} 
                                            style={styles.photoContainer}
                                            onPress={() => openViewer(uri)}
                                        >
                                            <Image source={{ uri }} style={styles.photo} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            {job.status === 'pending' && (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity
                        style={[styles.acceptBtnFull, { backgroundColor: headerColor }, loading && { opacity: 0.7 }]}
                        onPress={handleAcceptJob}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <View style={styles.btnRow}>
                                <Text style={styles.acceptBtnText}>✓ Accept Job — Earn ${earnings.toFixed(2)}</Text>
                                {hasOvertime && (
                                    <Text style={styles.otSnippet}>+${netOT.toFixed(2)}/hr for work over {dur} mins</Text>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
            {/* Full Screen Image Viewer */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalClose} 
                        onPress={() => setViewerVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image 
                            source={{ uri: selectedImage }} 
                            style={styles.fullImage} 
                            resizeMode="contain" 
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    premiumHeader: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerInfo: { flex: 1 },
    headerCategory: { fontSize: Typography.tiny, fontWeight: '900', color: '#fff', letterSpacing: 1 },
    headerTitle: { fontSize: Typography.h3, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    headerBookingId: { fontSize: Typography.caption, color: '#fff', marginTop: 2 },
    headerEarnings: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
    earningsLabelTop: { fontSize: Typography.tiny, fontWeight: '900', color: '#fff' },
    earningsValueTop: { fontSize: Typography.h2, fontWeight: '900', color: '#fff' },
    headerBadges: { flexDirection: 'row', gap: 10, marginTop: 16 },
    hBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    hBadgeText: { fontSize: Typography.caption, fontWeight: '600', color: '#fff' },

    mainContent: { padding: 20 },
    successBanner: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, borderWidth: 1, borderColor: '#dcfce7' },
    successBannerText: { fontSize: Typography.body, fontWeight: '700', color: TEAL_DARK },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: Typography.body, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    detailsCard: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    priceLabel: { fontSize: Typography.body, color: '#64748b', fontWeight: '500' },
    priceSubValue: { fontSize: Typography.caption, color: '#94a3b8', marginTop: 2 },
    priceValue: { fontSize: Typography.input, fontWeight: '700' },
    totalRow: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    totalLabel: { fontSize: Typography.bodyLarge, fontWeight: '900', color: '#1e293b' },
    totalValue: { fontSize: Typography.h4, fontWeight: '900' },

    otBreakdown: { marginTop: 8 },
    otDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
    potentialCard: { backgroundColor: '#f5f3ff', borderRadius: 20, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#ddd6fe' },
    potentialTitle: { fontSize: Typography.caption, fontWeight: '800', color: TEAL_DARK, marginBottom: 12 },
    pBoxRow: { flexDirection: 'row', marginBottom: 12 },
    pBox: { flex: 1, paddingVertical: 4, alignItems: 'center' },
    pBoxLabel: { fontSize: Typography.tiny, color: TEAL_DARK, fontWeight: '700', textTransform: 'uppercase' },
    pBoxValue: { fontSize: Typography.h5, fontWeight: '900', color: TEAL_DARK, marginTop: 4 },
    pBoxFootnote: { fontSize: Typography.tiny, color: '#94a3b8', textAlign: 'center' },

    detailItem: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    detailTextContainer: { flex: 1, justifyContent: 'center' },
    detailLabel: { fontSize: Typography.tiny, color: '#b45309', fontWeight: '700', textTransform: 'uppercase' },
    detailValue: { fontSize: Typography.input, color: TEAL_DARK, fontWeight: '700', marginTop: 2 },

    timingNote: { marginTop: 4, paddingLeft: 60 },
    timingNoteLabel: { fontSize: Typography.caption, fontWeight: '700', color: '#b45309' },
    timingNoteVal: { fontSize: Typography.bodySmall, color: TEAL_DARK, marginTop: 2, lineHeight: 18 },

    addressBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    addressLine: { fontSize: Typography.input, fontWeight: '700', color: '#1e293b' },
    addressSub: { fontSize: Typography.bodySmall, color: '#64748b', marginTop: 2 },
    accessGrid: { flexDirection: 'row', gap: 10 },
    aBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
    aBadgeDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
    aBadgeText: { fontSize: Typography.tiny, fontWeight: '800' },

    descText: { fontSize: Typography.input, color: '#334155', lineHeight: Typography.getLineHeight(Typography.input) },
    instructionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    instructionText: { flex: 1, fontSize: Typography.body, color: '#0d9488', fontWeight: '500', lineHeight: Typography.getLineHeight(Typography.body) },

    photoContainer: { width: 120, height: 120, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1f5f9' },
    photo: { width: '100%', height: '100%', resizeMode: 'cover' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    acceptBtnFull: { height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    btnRow: { alignItems: 'center' },
    acceptBtnText: { fontSize: Typography.buttonText, fontWeight: '900', color: '#fff' },
    otSnippet: { fontSize: Typography.tiny, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 4 },

    // Workflow Styles
    workflowSection: { marginBottom: 30 },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 10 },
    stepItem: { alignItems: 'center', width: 60 },
    stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderEraser: 2, borderColor: '#e2e8f0' },
    stepCircleDone: { backgroundColor: TEAL_DARK, borderColor: TEAL_DARK },
    stepNum: { fontSize: Typography.tiny, fontWeight: 'bold', color: '#94a3b8' },
    stepLabel: { fontSize: Typography.getCustom(9), fontWeight: 'bold', color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' },
    stepLabelDone: { color: TEAL_DARK },
    stepLine: { flex: 1, height: 2, backgroundColor: '#f1f5f9', marginBottom: 12 },
    stepLineDone: { backgroundColor: TEAL_DARK },
    activePhase: { marginBottom: 8 },
    historySection: { marginTop: 20, padding: 16, backgroundColor: '#f8fafc', borderRadius: 20, borderEraser: 1, borderColor: '#f1f5f9' },
    historyTitle: { fontSize: Typography.caption, fontWeight: 'bold', color: '#64748b', marginBottom: 12, textTransform: 'uppercase' },
    historyPhoto: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#e2e8f0' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    }
});

export default JobDetailsScreen;
