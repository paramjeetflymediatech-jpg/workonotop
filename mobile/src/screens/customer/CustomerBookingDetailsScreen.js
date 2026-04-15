import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar, Modal, Dimensions, Alert, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';
const BG_COLOR = '#f8fafc';

const CustomerBookingDetailsScreen = ({ route, navigation }) => {
    const { bookingId } = route.params;
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [ratingVisible, setRatingVisible] = useState(false);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [disputeVisible, setDisputeVisible] = useState(false);
    const [disputeText, setDisputeText] = useState('');
    const [photos, setPhotos] = useState({ before: [], after: [], customer: [] });
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [bookingId]);

    const openViewer = (url) => {
        setSelectedImage(url);
        setViewerVisible(true);
    };

    const fetchDetails = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await apiService.customer.getBookingDetails(bookingId, user?.token);
            if (res && res.data) {
                const b = Array.isArray(res.data) ? res.data[0] : res.data;
                setBooking(b);
                
                // API returns: before_photos = [{url, uploaded_at}], after_photos = [{url, uploaded_at}], photos = [string]
                setPhotos({
                    before: b.before_photos || [],
                    after: b.after_photos || [],
                    customer: (b.photos || []).map(p => typeof p === 'string' ? { url: p } : p)
                });
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setImgError(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDetails();
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await apiService.post(
                                `/api/customer/bookings/${bookingId}/cancel`,
                                {},
                                user?.token
                            );
                            if (res?.success) {
                                Alert.alert('Cancelled', 'Your booking has been cancelled.', [
                                    { text: 'OK', onPress: () => { fetchDetails(); } }
                                ]);
                            } else {
                                Alert.alert('Error', res?.message || 'Could not cancel booking.');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Failed to cancel booking.');
                        }
                    },
                },
            ]
        );
    };

    const openChat = () => {
        navigation.navigate('Chat', {
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            role: 'customer',
            otherPartyName: booking.provider_name || 'Provider',
        });
    };

    const handleApprove = async () => {
        Alert.alert('Approve & Complete?', 'This will finalize the job and release payment to the professional.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve & Pay', onPress: async () => {
                    setActionLoading('approve');
                    try {
                        await apiService.post(`/api/customer/bookings/${bookingId}/approve`, { action: 'approve' }, user?.token);
                        // Wait 1s for DB to update status to 'completed' before allowing review
                        await new Promise(r => setTimeout(r, 1000));
                        await fetchDetails();
                        Alert.alert('Success!', 'The job is now completed successfully.', [
                            { text: 'Rate Service', onPress: () => setRatingVisible(true) },
                            { text: 'Skip', style: 'cancel' }
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

    const handleDispute = () => {
        setDisputeVisible(true);
    };

    const submitDispute = async () => {
        if (!disputeText.trim()) {
            Alert.alert('Error', 'Please provide a reason for the dispute.');
            return;
        }

        setActionLoading('dispute');
        try {
            await apiService.post(`/api/customer/bookings/${bookingId}/approve`, { 
                action: 'dispute', 
                dispute_reason: disputeText 
            }, user?.token);
            
            Alert.alert('Dispute Opened', 'Our team will contact you shortly.', [
                { text: 'OK', onPress: () => {
                    setDisputeVisible(false);
                    fetchDetails();
                }}
            ]);
        } catch (err) {
            Alert.alert('Error', 'Failed to open dispute. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const submitReview = async () => {
        try {
            setActionLoading('review');
            await apiService.customer.submitReview({
                booking_id: parseInt(bookingId),   // must be int — API validates
                provider_id: booking.provider_id,
                customer_id: user?.id,
                rating: ratingValue,
                review: reviewText,
                is_anonymous: 0
            }, user?.token);
            Alert.alert('Thank You!', 'Your review has been successfully submitted.');
            setRatingVisible(false);
            fetchDetails();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const renderImageViewer = () => (
        <Modal
            visible={viewerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setViewerVisible(false)}
        >
            <View style={styles.viewerContainer}>
                <TouchableOpacity 
                    style={styles.viewerCloseBtn} 
                    onPress={() => setViewerVisible(false)}
                >
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
                {selectedImage && (
                    <Image 
                        source={{ uri: selectedImage }} 
                        style={styles.viewerImage} 
                        resizeMode="contain" 
                    />
                )}
            </View>
        </Modal>
    );

    const renderDisputeModal = () => (
        <Modal
            visible={disputeVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setDisputeVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setDisputeVisible(false)}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Open a Dispute</Text>
                    <Text style={styles.modalSubtitle}>Please tell us why you are disputing this job. Our team will review it.</Text>
                    
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Describe the issue in detail..."
                        multiline
                        numberOfLines={6}
                        value={disputeText}
                        onChangeText={setDisputeText}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.disputeSubmitBtn, actionLoading === 'dispute' && { opacity: 0.7 }]} 
                        onPress={submitDispute}
                        disabled={actionLoading === 'dispute'}
                    >
                        {actionLoading === 'dispute' ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.disputeSubmitBtnText}>Submit Dispute</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderRatingModal = () => (
        <Modal
            visible={ratingVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setRatingVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setRatingVisible(false)}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Rate Your Experience</Text>
                    <Text style={styles.modalSubtitle}>How was the service provided by {booking?.provider_name}?</Text>
                    
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setRatingValue(i)}>
                                <Ionicons name={i <= ratingValue ? "star" : "star-outline"} size={40} color="#f59e0b" style={{ marginHorizontal: 5 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Write a brief review (optional)..."
                        multiline
                        numberOfLines={4}
                        value={reviewText}
                        onChangeText={setReviewText}
                    />
                    
                    <TouchableOpacity 
                        style={styles.submitReviewBtn} 
                        onPress={submitReview}
                        disabled={actionLoading === 'review'}
                    >
                        {actionLoading === 'review' ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderCenter}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderCenter}>
                    <Text style={styles.errorText}>Could not load booking details.</Text>
                    <TouchableOpacity style={styles.backBtnError} onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtnTxt}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const imageUrl = booking.service_image
        ? (booking.service_image.startsWith('http') ? booking.service_image : `${API_BASE_URL}${booking.service_image}`)
        : null;

    const basePrice = parseFloat(booking.service_price || 0);
    const overtimeRate = parseFloat(booking.additional_price || 0);
    const actualMinutes = parseInt(booking.actual_duration_minutes || 0);
    const standardMinutes = parseInt(booking.standard_duration_minutes || 60);
    
    const overtimeHoldAmount = overtimeRate * 2;
    const authAmount = booking.authorized_amount ? parseFloat(booking.authorized_amount) : (basePrice + overtimeHoldAmount);
    const isOvertime = actualMinutes > standardMinutes && overtimeRate > 0;
    const overtimeMinutes = isOvertime ? Math.min(actualMinutes - standardMinutes, 120) : 0;
    const overtimeCost = isOvertime ? Math.round((overtimeRate * overtimeMinutes / 60) * 100) / 100 : 0;
    const totalAmount = basePrice + overtimeCost;

    const statusConfig = {
        pending: { label: 'Pending', color: '#f59e0b', dot: '#f59e0b' },
        matching: { label: 'Finding Provider', color: '#f97316', dot: '#f97316' },
        confirmed: { label: 'Confirmed', color: '#2563eb', dot: '#2563eb' },
        in_progress: { label: 'In Progress', color: '#9333ea', dot: '#9333ea', pulse: true },
        awaiting_approval: { label: 'Needs Approval', color: '#d97706', dot: '#f59e0b', pulse: true },
        completed: { label: 'Completed', color: '#16a34a', dot: '#16a34a' },
        cancelled: { label: 'Cancelled', color: '#dc2626', dot: '#dc2626' },
        disputed: { label: 'Disputed', color: '#b91c1c', dot: '#b91c1c' },
    };
    const st = statusConfig[booking.status] || { label: booking.status, color: '#64748b', dot: '#64748b' };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color={PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: scale(40) }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={PRIMARY} />
                }
            >
                <View style={styles.cardInfo}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                        <Text style={[styles.statusLabel, { color: st.color }]}>{st.label.toUpperCase()}</Text>
                        <Text style={styles.headerBookingId}>#{booking.booking_number || booking.id}</Text>
                    </View>
                    <Text style={styles.serviceName}>{booking.service_name}</Text>
                </View>

                {booking.status === 'awaiting_approval' && (
                    <View style={styles.approvalBanner}>
                        <View style={styles.approvalIcon}>
                            <Text style={{ fontSize: 24 }}>🎉</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.approvalTitle}>Job Completed!</Text>
                            <Text style={styles.approvalSubtitle}>Please review the work and approve payment.</Text>
                        </View>
                    </View>
                )}

                {imageUrl && !imgError ? (
                    <Image 
                        source={{ uri: imageUrl }} 
                        onError={() => setImgError(true)} 
                        style={styles.serviceImage} 
                    />
                ) : (
                    <View style={[styles.serviceImage, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={48} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', marginTop: 8, fontWeight: 'bold' }}>No Image Available</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    <View style={styles.card}>
                        <View style={styles.iconRow}>
                            <Ionicons name="calendar-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{(new Date(booking.job_date)).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        </View>
                        <View style={[styles.iconRow, { marginTop: 10 }]}>
                            <Ionicons name="time-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{booking.job_time_slot}</Text>
                        </View>
                    </View>
                </View>

                {/* Job Timing - real start/end/duration from provider */}
                {(booking.started_at || booking.actual_duration_minutes > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⏱ Job Timing</Text>
                        <View style={styles.card}>
                            {booking.started_at && (
                                <View style={styles.timingRow}>
                                    <Text style={styles.timingLabel}>Started</Text>
                                    <Text style={styles.timingValue}>
                                        {new Date(booking.started_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            )}
                            {booking.completed_at && (
                                <View style={[styles.timingRow, { marginTop: 8 }]}>
                                    <Text style={styles.timingLabel}>Completed</Text>
                                    <Text style={styles.timingValue}>
                                        {new Date(booking.completed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            )}
                            {(booking.actual_duration_minutes > 0 || booking.duration_minutes > 0) && (
                                <View style={[styles.timingRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                                    <Text style={styles.timingLabel}>Duration</Text>
                                    <View style={styles.row}>
                                        <Text style={[styles.timingValue, { color: PRIMARY, fontWeight: '900' }]}>
                                            {booking.actual_duration_minutes > 0 ? `${booking.actual_duration_minutes} min` : 'In Progress'}
                                        </Text>
                                        <Text style={styles.timingStandard}>
                                            {' '}(standard: {booking.duration_minutes || booking.standard_duration_minutes || 60}min)
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Location</Text>
                    <View style={styles.card}>
                        <View style={styles.iconRow}>
                            <Ionicons name="location-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>
                                {booking.address_line1}{booking.city ? `, ${booking.city}` : ''}{booking.postal_code ? `, ${booking.postal_code}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <View style={styles.card}>
                        {(booking.customer_first_name || booking.customer_last_name) && (
                            <View style={[styles.iconRow, { marginBottom: 10 }]}>
                                <Ionicons name="person-outline" size={moderateScale(20)} color={PRIMARY} />
                                <Text style={styles.cardTextVals}>{booking.customer_first_name} {booking.customer_last_name}</Text>
                            </View>
                        )}
                        <View style={styles.iconRow}>
                            <Ionicons name="call-outline" size={moderateScale(20)} color={PRIMARY} />
                            <Text style={styles.cardTextVals}>{booking.customer_phone}</Text>
                        </View>
                        {booking.customer_email && (
                            <View style={[styles.iconRow, { marginTop: 10 }]}>
                                <Ionicons name="mail-outline" size={moderateScale(20)} color={PRIMARY} />
                                <Text style={styles.cardTextVals}>{booking.customer_email}</Text>
                            </View>
                        )}
                    </View>
                </View> */}

                {booking.provider_name && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Professional</Text>
                        <View style={styles.card}>
                            <View style={styles.iconRow}>
                                <Ionicons name="person-circle-outline" size={moderateScale(24)} color={PRIMARY} />
                                <View style={{ marginLeft: scale(10), flex: 1 }}>
                                    <Text style={[styles.cardTextVals, { marginLeft: 0 }]}>{booking.provider_name}</Text>
                                    <View style={styles.providerRatingRow}>
                                        <Ionicons name="star" size={14} color="#f59e0b" />
                                        <Text style={styles.providerRating}>{booking.provider_rating || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                            {booking.provider_phone && (
                                <View style={[styles.iconRow, { marginTop: 12 }]}>
                                    <Ionicons name="call-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>{booking.provider_phone}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {booking.job_description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <View style={styles.card}>
                            <Text style={styles.descriptionText}>{booking.job_description}</Text>
                        </View>
                    </View>
                )}

                {(booking.timing_constraints || booking.instructions) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Extra Details</Text>
                        <View style={styles.card}>
                            {booking.timing_constraints && (
                                <View style={styles.iconRow}>
                                    <Ionicons name="hourglass-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>Limits: {booking.timing_constraints}</Text>
                                </View>
                            )}
                            {booking.instructions && (
                                <View style={[styles.iconRow, { marginTop: 10 }]}>
                                    <Ionicons name="information-circle-outline" size={moderateScale(18)} color="#64748b" />
                                    <Text style={styles.extraText}>Notes: {booking.instructions}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Access & Amenities</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, booking.parking_access && styles.badgeActive]}>
                            <Ionicons name="car-outline" size={12} color={booking.parking_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.parking_access && styles.badgeTextActive]}>Parking</Text>
                        </View>
                        <View style={[styles.badge, booking.elevator_access && styles.badgeActive]}>
                            <Ionicons name="business-outline" size={12} color={booking.elevator_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.elevator_access && styles.badgeTextActive]}>Elevator</Text>
                        </View>
                        <View style={[styles.badge, booking.has_pets && styles.badgeActive]}>
                            <Ionicons name="paw-outline" size={12} color={booking.has_pets ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, booking.has_pets && styles.badgeTextActive]}>Pets</Text>
                        </View>
                    </View>
                </View>

                {/* Categorized Photos */}
                {photos.before.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📸 Before Photos ({photos.before.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {photos.before.map((p, idx) => {
                                const rawUrl = p.url || p.photo_url || '';
                                const uri = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                                return (
                                    <TouchableOpacity key={idx} onPress={() => openViewer(uri)}>
                                        <Image source={{ uri }} style={styles.photoMini} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {photos.after.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>✅ After Photos ({photos.after.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {photos.after.map((p, idx) => {
                                const rawUrl = p.url || p.photo_url || '';
                                const uri = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                                return (
                                    <TouchableOpacity key={idx} onPress={() => openViewer(uri)}>
                                        <Image source={{ uri }} style={styles.photoMini} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {photos.customer.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📎 Customer Uploads ({photos.customer.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {photos.customer.map((p, idx) => {
                                const rawUrl = p.url || p.photo_url || '';
                                const uri = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                                return (
                                    <TouchableOpacity key={idx} onPress={() => openViewer(uri)}>
                                        <Image source={{ uri }} style={styles.photoMini} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Payment Breakdown</Text>
                    <View style={styles.invoiceCard}>
                        <View style={styles.invoiceHeader}>
                            <Text style={styles.invoiceHeaderTitle}>INVOICE SUMMARY</Text>
                            <View style={[styles.paymentBadge, { backgroundColor: booking.payment_status === 'paid' ? '#dcfce7' : '#fef3c7' }]}>
                                <Text style={[styles.paymentBadgeText, { color: booking.payment_status === 'paid' ? '#166534' : '#92400e' }]}>
                                    {(booking.payment_status || 'PENDING').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.invoiceItem}>
                            <View>
                                <Text style={styles.invoiceItemLabel}>Base Service Price</Text>
                                <Text style={styles.invoiceItemSub}>Flat rate ({standardMinutes}min)</Text>
                            </View>
                            <Text style={styles.invoiceItemValue}>{formatCurrency(basePrice)}</Text>
                        </View>

                        {overtimeRate > 0 && (
                            <View style={styles.invoiceItem}>
                                <View>
                                    <View style={styles.row}>
                                        <Ionicons name="time" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                                        <Text style={styles.invoiceItemLabel}>Overtime Hold</Text>
                                    </View>
                                    <Text style={styles.invoiceItemSub}>{formatCurrency(overtimeRate)}/hr × 2 hrs (max hold)</Text>
                                </View>
                                <Text style={[styles.invoiceItemValue, { color: '#d97706' }]}>+{formatCurrency(overtimeHoldAmount)}</Text>
                            </View>
                        )}

                        {isOvertime && (
                            <View style={[styles.invoiceItem, { backgroundColor: '#f5f3ff', marginHorizontal: -16, paddingHorizontal: 16 }]}>
                                <View>
                                    <View style={styles.row}>
                                        <Ionicons name="time-outline" size={14} color="#8b5cf6" style={{ marginRight: 4 }} />
                                        <Text style={[styles.invoiceItemLabel, { color: '#7c3aed' }]}>Actual Overtime Used</Text>
                                    </View>
                                    <Text style={styles.invoiceItemSub}>{overtimeMinutes}min at {formatCurrency(overtimeRate)}/hr</Text>
                                </View>
                                <Text style={[styles.invoiceItemValue, { color: '#7c3aed' }]}>+{formatCurrency(overtimeCost)}</Text>
                            </View>
                        )}

                        <View style={styles.invoiceItem}>
                            <View>
                                <Text style={styles.invoiceItemLabel}>Total Authorized Hold</Text>
                                <Text style={styles.invoiceItemSub}>Card hold — not charged yet</Text>
                            </View>
                            <Text style={[styles.invoiceItemValue, { color: '#2563eb' }]}>{formatCurrency(authAmount)}</Text>
                        </View>

                        <View style={styles.invoiceTotal}>
                            <View>
                                <Text style={styles.invoiceTotalLabel}>
                                    {booking.status === 'completed' ? 'Amount Charged' : 'Final Amount'}
                                </Text>
                                <Text style={styles.invoiceTotalSub}>Based on actual work time</Text>
                            </View>
                            <Text style={[styles.invoiceTotalValue, { color: isOvertime ? '#7c3aed' : PRIMARY }]}>
                                {formatCurrency(totalAmount)}
                            </Text>
                        </View>

                        {booking.status !== 'completed' && (
                            <View style={styles.authorizedNote}>
                                <Ionicons name="card" size={16} color="#b45309" />
                                <Text style={styles.authorizedNoteText}>
                                    Your card is authorized for <Text style={{ fontWeight: 'bold' }}>{formatCurrency(authAmount)}</Text>. You will only be charged the final amount after completion.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status Timeline</Text>
                    <View style={styles.card}>
                        {booking.status_history && booking.status_history.length > 0 ? (
                            booking.status_history.map((history, idx) => (
                                <View key={history.id} style={styles.timelineRow}>
                                    <View style={styles.timelineIndicator}>
                                        <View style={styles.timelineDot} />
                                        {idx !== booking.status_history.length - 1 && <View style={styles.timelineLine} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineStatus}>
                                            {history.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Text>
                                        <Text style={styles.timelineDate}>{new Date(history.created_at).toLocaleString()}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.timelineRow}>
                                <View style={styles.timelineIndicator}>
                                    <View style={styles.timelineDot} />
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineStatus}>{booking.status}</Text>
                                    <Text style={styles.timelineDate}>{new Date(booking.created_at).toLocaleString()}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    {['confirmed', 'in_progress'].includes(booking.status) && booking.provider_name && (
                        <TouchableOpacity style={styles.chatBtn} onPress={openChat} activeOpacity={0.8}>
                            <Ionicons name="chatbubble-ellipses-outline" size={moderateScale(18)} color="#fff" />
                            <Text style={styles.chatBtnText}>Chat with Provider</Text>
                        </TouchableOpacity>
                    )}
                    {booking.status === 'awaiting_approval' && (
                        <>
                            <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} disabled={actionLoading === 'approve'}>
                                {actionLoading === 'approve' ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={moderateScale(18)} color="#fff" />
                                        <Text style={styles.approveBtnText}>Approve & Complete</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.disputeBtn} onPress={handleDispute} disabled={actionLoading === 'dispute'}>
                                {actionLoading === 'dispute' ? <ActivityIndicator color="#ef4444" /> : (
                                    <>
                                        <Ionicons name="warning-outline" size={moderateScale(18)} color="#ef4444" />
                                        <Text style={styles.disputeBtnText}>Open Dispute</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                </View>

            </ScrollView>
            {renderImageViewer()}
            {renderRatingModal()}
            {renderDisputeModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: moderateScale(16), color: '#64748b', marginBottom: 20 },
    backBtnError: { backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    backBtnTxt: { color: '#fff', fontWeight: 'bold' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(12), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },

    scrollContent: { padding: moderateScale(20), paddingBottom: verticalScale(40) },
    
    cardInfo: { marginBottom: verticalScale(20) },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusLabel: { fontSize: Typography.tiny, fontWeight: 'bold', letterSpacing: 0.5 },
    headerBookingId: { fontSize: Typography.tiny, textSpacing: 2, color: '#000000ff', marginLeft: 'auto', fontWeight: 'bold' },
    serviceName: { fontSize: moderateScale(26), fontWeight: '900', color: '#0f172a' },
    bookingNumber: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(5) },

    serviceImage: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(20),
        resizeMode: 'contain',
        backgroundColor: '#f1f5f9'
    },

    section: { marginBottom: verticalScale(25) },
    sectionTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: verticalScale(10), marginLeft: scale(5) },
    
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
    },
    iconRow: { flexDirection: 'row', alignItems: 'center' },
    cardTextVals: { fontSize: moderateScale(15), color: '#0f172a', marginLeft: scale(10), flex: 1, fontWeight: '500' },

    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: verticalScale(6) },
    pricingLabel: { fontSize: moderateScale(14), color: '#475569' },
    pricingValue: { fontSize: moderateScale(14), fontWeight: '600', color: '#0f172a' },
    totalRow: { marginTop: verticalScale(10), paddingTop: verticalScale(10), borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    totalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    totalValue: { fontSize: moderateScale(18), fontWeight: 'bold', color: PRIMARY },

    /* Banner */
    approvalBanner: {
        backgroundColor: '#fffbeb', borderRadius: 20, padding: 20,
        flexDirection: 'row', alignItems: 'center', gap: 15,
        borderWidth: 2, borderColor: '#fef3c7', marginBottom: 25,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
    },
    approvalIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' },
    approvalTitle: { fontSize: 17, fontWeight: '900', color: '#92400e' },
    approvalSubtitle: { fontSize: 13, color: '#b45309', marginTop: 2 },

    /* Invoice styles */
    invoiceCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    invoiceHeaderTitle: { fontSize: Typography.getCustom(10), fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
    paymentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    paymentBadgeText: { fontSize: Typography.getCustom(10), fontWeight: '900' },
    invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    invoiceItemLabel: { fontSize: Typography.body, fontWeight: '700', color: '#334155' },
    invoiceItemSub: { fontSize: Typography.tiny, color: '#94a3b8', marginTop: 2 },
    invoiceItemValue: { fontSize: Typography.body, fontWeight: 'bold', color: '#1e293b' },
    invoiceTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15 },
    invoiceTotalLabel: { fontSize: Typography.bodyLarge, fontWeight: '900', color: '#0f172a' },
    invoiceTotalSub: { fontSize: Typography.tiny, color: '#94a3b8', marginTop: 2 },
    invoiceTotalValue: { fontSize: Typography.h3, fontWeight: '900' },
    authorizedNote: { marginTop: 20, padding: 12, backgroundColor: '#fffbeb', borderRadius: 12, flexDirection: 'row', gap: 10 },
    authorizedNoteText: { flex: 1, fontSize: Typography.tiny, color: '#92400e', lineHeight: Typography.getLineHeight(Typography.tiny) },

    row: { flexDirection: 'row', alignItems: 'center' },

    /* Timing */
    timingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timingLabel: { fontSize: Typography.bodySmall, color: '#64748b', fontWeight: '600' },
    timingValue: { fontSize: Typography.bodySmall, color: '#0f172a', fontWeight: '700' },
    timingStandard: { fontSize: Typography.tiny, color: '#000000ff' },

    timelineRow: { flexDirection: 'row' },
    timelineIndicator: { alignItems: 'center', width: scale(30) },
    timelineDot: { width: moderateScale(12), height: moderateScale(12), borderRadius: moderateScale(6), backgroundColor: PRIMARY, zIndex: 2 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginVertical: verticalScale(4) },
    timelineContent: { flex: 1, paddingBottom: verticalScale(20), paddingTop: verticalScale(-2) },
    timelineStatus: { fontSize: Typography.input, fontWeight: 'bold', color: '#0f172a', textTransform: 'capitalize' },
    timelineDate: { fontSize: Typography.caption, color: '#64748b', marginTop: verticalScale(2) },

    descriptionText: { fontSize: Typography.input, color: '#334155', lineHeight: Typography.getLineHeight(Typography.input) },
    extraText: { fontSize: Typography.body, color: '#475569', marginLeft: scale(10), flex: 1 },
    providerRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    providerRating: { fontSize: moderateScale(13), color: '#64748b', marginLeft: 4 },

    /* Badge Styles */
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    badgeActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    badgeText: { marginLeft: scale(4), fontSize: moderateScale(12), fontWeight: '600', color: '#64748b' },
    badgeTextActive: { color: '#fff' },

    /* Photo Grid */
    photoList: { gap: 12, paddingRight: 20 },
    photoMini: { width: scale(100), height: scale(100), borderRadius: 16, backgroundColor: '#f1f5f9' },

    /* Action Buttons */
    actionsRow: { gap: verticalScale(12), marginBottom: verticalScale(30), marginTop: verticalScale(4) },
    chatBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: PRIMARY, borderRadius: moderateScale(14),
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
        elevation: 2, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
    },
    chatBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff', borderRadius: moderateScale(14),
        borderWidth: 2, borderColor: '#fca5a5',
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
    },
    cancelBtnText: { color: '#b91c1c', fontWeight: '700', fontSize: moderateScale(15) },

    /* Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    viewerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },

    /* Approve & Dispute Buttons */
    approveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#16a34a', borderRadius: moderateScale(14),
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
        elevation: 2, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
    },
    approveBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
    disputeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff', borderRadius: moderateScale(14),
        borderWidth: 2, borderColor: '#fca5a5',
        paddingVertical: verticalScale(14), paddingHorizontal: scale(20),
    },
    disputeBtnText: { color: '#ef4444', fontWeight: '700', fontSize: moderateScale(15) },

    /* Rating Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '85%', borderRadius: moderateScale(20), padding: moderateScale(25), alignItems: 'center' },
    modalCloseIcon: { position: 'absolute', top: verticalScale(15), right: scale(15) },
    modalTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(5), marginTop: verticalScale(10) },
    modalSubtitle: { fontSize: moderateScale(13), color: '#64748b', textAlign: 'center', marginBottom: verticalScale(20) },
    starsRow: { flexDirection: 'row', marginBottom: verticalScale(20) },
    reviewInput: { width: '100%', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: moderateScale(12), padding: moderateScale(15), textAlignVertical: 'top', fontSize: moderateScale(14), color: '#334155', marginBottom: verticalScale(20), backgroundColor: '#f8fafc' },
    submitReviewBtn: { backgroundColor: PRIMARY, width: '100%', paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center' },
    submitReviewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(16) },

    /* Dispute Modal */
    disputeSubmitBtn: { backgroundColor: '#ef4444', width: '100%', paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center' },
    disputeSubmitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(16) }
});

export default CustomerBookingDetailsScreen;
