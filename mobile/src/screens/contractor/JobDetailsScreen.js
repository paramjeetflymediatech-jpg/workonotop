import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, Alert, ActivityIndicator, Image, StatusBar,
    Dimensions, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import { API_BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

const JobDetailsScreen = ({ navigation, route }) => {
    const { job: initialJob } = route.params || {};
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [job, setJob] = useState(initialJob);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLatestJob = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await api.get(`/api/provider/jobs/${job.id}`);
            if (res.success && res.data) {
                setJob(res.data);
            }
        } catch (err) {
            console.error('Error re-fetching job details:', err);
        } finally {
            if (!isRefresh) setLoading(false);
            setRefreshing(false);
        }
    }, [job?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLatestJob(true);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchLatestJob();
        });
        return unsubscribe;
    }, [navigation, fetchLatestJob]);

    const handleAcceptJob = async () => {
        Alert.alert('Accept Job?', 'Are you sure you want to accept this job?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Accept', onPress: async () => {
                    setLoading(true);
                    try {
                        const res = await api.post('/api/provider/available-jobs', { booking_id: job.id });
                        if (res.success) {
                            // Update local state instead of just going back
                            setJob(prev => ({
                                ...prev,
                                status: 'confirmed',
                                provider_id: user?.id,
                                provider_name: user?.name
                            }));
                            Alert.alert('Success', 'Job accepted! You can now start the job when ready.');
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
        ]);
    };

    const statusStyles = {
        pending: { bg: '#fef3c7', text: '#d97706', label: 'Available' },
        confirmed: { bg: '#dbeafe', text: '#2563eb', label: 'Confirmed' },
        in_progress: { bg: '#f3e8ff', text: '#9333ea', label: 'In Progress' },
        completed: { bg: '#dcfce7', text: '#16a34a', label: 'Completed' },
        disputed: { bg: '#fee2e2', text: '#dc2626', label: 'Disputed' },
        cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' },
    };

    const currentStatus = statusStyles[job?.status] || { bg: '#f1f5f9', text: '#64748b', label: job?.status };

    const DetailItem = ({ icon, label, value, color = "#14b8a6" }) => (
        <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
            </View>
        </View>
    );

    const PriceRow = ({ label, value, isTotal = false, isHighlight = false }) => (
        <View style={[styles.priceRow, isTotal && styles.totalRow]}>
            <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>{label}</Text>
            <Text style={[
                styles.priceValue, 
                isTotal && styles.totalValue,
                isHighlight && { color: '#ef4444' }
            ]}>
                {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
            </Text>
        </View>
    );

    if (!job) return null;

    const imageUrl = job.service_image 
        ? (job.service_image.startsWith('http') ? job.service_image : `${API_BASE_URL}${job.service_image}`)
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false} 
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#14b8a6" />
                }
            >
                {/* Hero / Image Section */}
                <View style={styles.heroContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, styles.placeholderHero]}>
                            <Ionicons name="image-outline" size={64} color="#cbd5e1" />
                        </View>
                    )}
                    <View style={styles.heroGradient} />
                    
                    {/* Header Overlay */}
                    <View style={[styles.headerOverlay, { top: Math.max(insets.top, 20) }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayBackBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Chat', {
                                bookingId: job.id,
                                bookingNumber: job.booking_number || job.id,
                                role: 'provider',
                                otherPartyName: job.customer_first_name ? `${job.customer_first_name} ${job.customer_last_name || ''}`.trim() : 'Customer',
                            })}
                            style={[styles.overlayChatBtn, job.status === 'pending' && { opacity: 0.5 }]}
                            disabled={job.status === 'pending'}
                        >
                            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
                            <Text style={[styles.statusText, { color: currentStatus.text }]}>{currentStatus.label}</Text>
                        </View>
                        <Text style={styles.serviceNameHero}>{job.service_name}</Text>
                        <View style={styles.categoryRow}>
                            <Text style={styles.categoryIcon}>{job.category_icon || '🛠️'}</Text>
                            <Text style={styles.categoryName}>{job.category_name || 'General Service'}</Text>
                            <View style={styles.dot} />
                            <Text style={styles.bookingIdHero}>#{job.booking_number || `BK-${job.id}`}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Earnings Card */}
                    <View style={styles.earningsCard}>
                        <View style={styles.earningsInfo}>
                            <Text style={styles.earningsLabel}>Your Net Earnings</Text>
                            <Text style={styles.earningsValue}>${parseFloat(job.display_amount ?? job.provider_amount ?? 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.earningsDivider} />
                        <View style={styles.earningsMeta}>
                            <View style={styles.metaBox}>
                                <Text style={styles.metaLabel}>Base Pay</Text>
                                <Text style={styles.metaValue}>${parseFloat(job.pricing?.provider_base_earnings || job.provider_amount || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.metaBox}>
                                <Text style={styles.metaLabel}>Duration</Text>
                                <Text style={styles.metaValue}>{job.service_duration || job.pricing?.duration_minutes || '--'} min</Text>
                            </View>
                        </View>
                    </View>

                    {/* Schedule Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Schedule & Location</Text>
                        <View style={styles.detailsCard}>
                            <DetailItem 
                                icon="calendar-outline" 
                                label="Job Date" 
                                value={new Date(job.job_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                            />
                            <DetailItem 
                                icon="time-outline" 
                                label="Preferred Time" 
                                value={Array.isArray(job.job_time_slot) ? job.job_time_slot.join(', ') : (job.job_time_slot || 'Flexible')} 
                            />
                            <DetailItem 
                                icon="location-outline" 
                                label="Service Address" 
                                value={`${job.address_line1}${job.city ? ', ' + job.city : ''}${job.postal_code ? ', ' + job.postal_code : ''}`} 
                                color="#ef4444"
                            />
                        </View>
                    </View>

                    {/* Customer Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👤 Customer Information</Text>
                        <View style={styles.detailsCard}>
                            <DetailItem 
                                icon="person-outline" 
                                label="Customer Name" 
                                value={job.customer_first_name ? `${job.customer_first_name} ${job.customer_last_name || ''}`.trim() : 'Private Customer'} 
                                color="#6366f1"
                            />
                            {job.status !== 'pending' && (
                                <View style={styles.customerActions}>
                                    <TouchableOpacity style={styles.customerActionBtn}>
                                        <Ionicons name="call" size={18} color="#6366f1" />
                                        <Text style={styles.customerActionText}>Call</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.customerActionBtn}
                                        onPress={() => navigation.navigate('Chat', {
                                            bookingId: job.id,
                                            bookingNumber: job.booking_number || job.id,
                                            role: 'provider',
                                            otherPartyName: job.customer_first_name ? `${job.customer_first_name} ${job.customer_last_name || ''}`.trim() : 'Customer',
                                        })}
                                    >
                                        <Ionicons name="chatbubble" size={18} color="#6366f1" />
                                        <Text style={styles.customerActionText}>Message</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Job Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Job Requirements</Text>
                        <View style={styles.detailsCard}>
                            {job.status === 'disputed' && job.dispute_reason && (
                                <View style={styles.disputeNotice}>
                                    <View style={styles.disputeHeader}>
                                        <Ionicons name="warning" size={20} color="#dc2626" />
                                        <Text style={styles.disputeTitle}>Job Disputed</Text>
                                    </View>
                                    <Text style={styles.disputeReasonLabel}>Reason provided by customer:</Text>
                                    <Text style={styles.disputeReasonValue}>{job.dispute_reason}</Text>
                                    <Text style={styles.disputeFootnote}>Admin team is currently reviewing this case.</Text>
                                </View>
                            )}

                            <Text style={styles.descriptionText}>{job.job_description || 'No additional description provided for this job.'}</Text>
                            
                            {(job.timing_constraints || job.instructions) && (
                                <View style={styles.extraDetails}>
                                    {!!job.timing_constraints && (
                                        <View style={styles.extraItem}>
                                            <Text style={styles.extraLabel}>⏱ Timing Constraints:</Text>
                                            <Text style={styles.extraValue}>{job.timing_constraints}</Text>
                                        </View>
                                    )}
                                    {!!job.instructions && (
                                        <View style={styles.extraItem}>
                                            <Text style={styles.extraLabel}>📑 Special Instructions:</Text>
                                            <Text style={styles.extraValue}>{job.instructions}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Pricing Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 Financial Breakdown</Text>
                        <View style={styles.detailsCard}>
                            <PriceRow label="Service Base Price" value={parseFloat(job.service_price || 0)} />
                            <PriceRow label="Your Base Earnings" value={parseFloat(job.pricing?.provider_base_earnings || job.provider_amount || 0)} />
                            {job.pricing?.has_overtime && (
                                <PriceRow 
                                    label="Overtime Rate (Net)" 
                                    value={`$${parseFloat(job.pricing?.net_overtime_rate || 0).toFixed(2)} / hr`} 
                                />
                            )}
                            <PriceRow label="Total Estimated Pay" value={parseFloat(job.provider_amount || 0)} isTotal />
                            
                            {job.overtime_info?.message && (
                                <View style={styles.overtimeNotice}>
                                    <Ionicons name="information-circle" size={16} color="#0e7490" />
                                    <Text style={styles.overtimeNoticeText}>{job.overtime_info.message}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Access */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏢 Access & Environment</Text>
                        <View style={styles.accessRow}>
                            <View style={[styles.accessBadge, !job.parking_access && styles.accessBadgeDisabled]}>
                                <Ionicons name="car" size={16} color={job.parking_access ? '#14b8a6' : '#94a3b8'} />
                                <Text style={[styles.accessBadgeText, !job.parking_access && styles.accessBadgeTextDisabled]}>Parking</Text>
                            </View>
                            <View style={[styles.accessBadge, !job.elevator_access && styles.accessBadgeDisabled]}>
                                <Ionicons name="business" size={16} color={job.elevator_access ? '#14b8a6' : '#94a3b8'} />
                                <Text style={[styles.accessBadgeText, !job.elevator_access && styles.accessBadgeTextDisabled]}>Elevator</Text>
                            </View>
                            <View style={[styles.accessBadge, !job.has_pets && styles.accessBadgeDisabled]}>
                                <Ionicons name="paw" size={16} color={job.has_pets ? '#14b8a6' : '#94a3b8'} />
                                <Text style={[styles.accessBadgeText, !job.has_pets && styles.accessBadgeTextDisabled]}>Pets</Text>
                            </View>
                        </View>
                    </View>
                    
                    {/* Bottom Space */}
                    <View style={{ height: verticalScale(120) }} />
                </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={styles.bottomActions}>
                {job.status === 'pending' ? (
                    <TouchableOpacity 
                        style={[styles.primaryBtn, loading && styles.btnDisabled]} 
                        onPress={handleAcceptJob}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Accept Job Now</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : job.status === 'confirmed' ? (
                    <TouchableOpacity 
                        style={styles.primaryBtn} 
                        onPress={() => navigation.navigate('StartJob', { job })}
                    >
                        <Ionicons name="play" size={20} color="#fff" />
                        <Text style={styles.primaryBtnText}>2️⃣ Start Job</Text>
                    </TouchableOpacity>
                ) : job.status === 'in_progress' ? (
                    <TouchableOpacity 
                        style={styles.primaryBtn} 
                        onPress={() => navigation.navigate('FinishJob', { job })}
                    >
                        <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                        <Text style={styles.primaryBtnText}>4️⃣ Complete</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.primaryBtn, { backgroundColor: '#f1f5f9' }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.primaryBtnText, { color: '#64748b' }]}>Back to Jobs</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { },
    heroContainer: { height: verticalScale(300), width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderHero: { backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    heroGradient: { 
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', 
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, 
        shadowOpacity: 0.5, shadowRadius: 20 
    },
    headerOverlay: {
        position: 'absolute', left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 20, zIndex: 10
    },
    overlayBackBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    overlayChatBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    heroContent: { position: 'absolute', bottom: verticalScale(20), left: scale(20), right: scale(20), height: '50%'},
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: scale(12), paddingVertical: verticalScale(4), borderRadius: moderateScale(20), marginBottom: verticalScale(8) },
    statusText: { fontSize: moderateScale(10), fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    serviceNameHero: { 
        fontSize: moderateScale(26), fontWeight: 'bold', color: '#fff', marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    categoryIcon: { fontSize: 16, marginRight: 6 },
    categoryName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#64748b', marginHorizontal: 10 },
    bookingIdHero: { color: '#94a3b8', fontSize: 13 },

    mainContent: { padding: moderateScale(20), marginTop: -verticalScale(30), backgroundColor: '#fff', borderTopLeftRadius: moderateScale(30), borderTopRightRadius: moderateScale(30) },
    earningsCard: {
        backgroundColor: '#115e59', borderRadius: moderateScale(24), padding: moderateScale(20),
        flexDirection: 'row', alignItems: 'center',
        elevation: 8, shadowColor: '#115e59', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15,
        marginBottom: verticalScale(30)
    },
    earningsInfo: { flex: 1.2 },
    earningsLabel: { color: '#ccfbf1', fontSize: moderateScale(12), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    earningsValue: { color: '#fff', fontSize: moderateScale(32), fontWeight: 'bold', marginTop: verticalScale(4) },
    earningsDivider: { width: 1, height: '70%', backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: scale(20) },
    earningsMeta: { flex: 0.8, gap: verticalScale(12) },
    metaBox: { },
    metaLabel: { color: '#99f6e4', fontSize: moderateScale(10), fontWeight: '600' },
    metaValue: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },

    section: { marginBottom: verticalScale(30) },
    sectionTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#64748b', marginBottom: verticalScale(12), marginLeft: scale(4) },
    detailsCard: { backgroundColor: '#f8fafc', borderRadius: moderateScale(24), padding: moderateScale(18), borderWidth: 1, borderColor: '#f1f5f9' },
    detailItem: { flexDirection: 'row', marginBottom: verticalScale(18) },
    iconContainer: {
        width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14),
        justifyContent: 'center', alignItems: 'center', marginRight: scale(14)
    },
    detailTextContainer: { flex: 1, justifyContent: 'center' },
    detailLabel: { fontSize: moderateScale(11), color: '#94a3b8', marginBottom: verticalScale(2), fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { fontSize: moderateScale(15), color: '#0f172a', fontWeight: '600' },
    
    customerActions: { flexDirection: 'row', gap: scale(12), marginTop: verticalScale(4), paddingLeft: scale(58) },
    customerActionBtn: { 
        flexDirection: 'row', alignItems: 'center', gap: scale(6),
        backgroundColor: '#fff', paddingHorizontal: scale(16), paddingVertical: verticalScale(8),
        borderRadius: moderateScale(12), borderWidth: 1.5, borderColor: '#e0e7ff'
    },
    customerActionText: { color: '#6366f1', fontWeight: 'bold', fontSize: moderateScale(13) },

    descriptionText: { fontSize: moderateScale(15), color: '#334155', lineHeight: moderateScale(24) },
    extraDetails: { marginTop: verticalScale(18), paddingTop: verticalScale(18), borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: verticalScale(14) },
    extraItem: { },
    extraLabel: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#0f172a' },
    extraValue: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4), lineHeight: moderateScale(20) },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(12) },
    priceLabel: { color: '#64748b', fontSize: moderateScale(14) },
    priceValue: { color: '#0f172a', fontSize: moderateScale(14), fontWeight: '600' },
    totalRow: { marginTop: verticalScale(8), paddingTop: verticalScale(16), borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    totalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    totalValue: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#14b8a6' },
    overtimeNotice: { 
        marginTop: verticalScale(16), backgroundColor: '#ecfeff', padding: moderateScale(12), 
        borderRadius: moderateScale(12), flexDirection: 'row', gap: scale(8), alignItems: 'center'
    },
    overtimeNoticeText: { color: '#0e7490', fontSize: moderateScale(12), fontWeight: '600', flex: 1 },

    /* Dispute Notice in Job Details */
    disputeNotice: {
        backgroundColor: '#fff1f2',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#fecdd3'
    },
    disputeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#fecdd3'
    },
    disputeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626'
    },
    disputeReasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#991b1b',
        textTransform: 'uppercase',
        marginBottom: 4
    },
    disputeReasonValue: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
        marginBottom: 12,
        fontStyle: 'italic'
    },
    disputeFootnote: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'center'
    },


    accessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) },
    accessBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdfa',
        paddingHorizontal: scale(14), paddingVertical: verticalScale(10), borderRadius: moderateScale(16), gap: scale(8),
        borderWidth: 1, borderColor: '#ccfbf1'
    },
    accessBadgeDisabled: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
    accessBadgeText: { fontSize: moderateScale(13), color: '#115e59', fontWeight: '700' },
    accessBadgeTextDisabled: { color: '#94a3b8' },

    bottomActions: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: moderateScale(24), paddingBottom: verticalScale(34), backgroundColor: '#fff', 
        borderTopWidth: 1, borderTopColor: '#f1f5f9'
    },
    primaryBtn: {
        backgroundColor: '#14b8a6', paddingVertical: verticalScale(18), borderRadius: moderateScale(20),
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(10),
        elevation: 10, shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12
    },
    primaryBtnText: { color: '#fff', fontSize: moderateScale(18), fontWeight: 'bold' },
    btnDisabled: { opacity: 0.7 }
});

export default JobDetailsScreen;
