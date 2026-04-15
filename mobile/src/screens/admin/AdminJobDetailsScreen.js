import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar, Modal, Dimensions, TextInput, Alert, RefreshControl, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';
import { API_BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

const AdminJobDetailsScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { booking } = route.params || {};
    const [currentBooking, setCurrentBooking] = useState(booking);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);
    
    // Commission & Assignment states
    const [commissionValue, setCommissionValue] = useState('');
    const [isEditingCommission, setIsEditingCommission] = useState(false);
    const [savingCommission, setSavingCommission] = useState(false);
    const [tradespeople, setTradespeople] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [assignModalVisible, setAssignModalVisible] = useState(false);

    // Image Viewer state
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchBookingDetails = useCallback(async (showLoader = true) => {
        if (!booking?.id) return;
        try {
            if (showLoader) setLoading(true);
            const res = await api.get(`/api/bookings/${booking.id}`);
            if (res.success) {
                const data = res.data;
                setCurrentBooking(data);
                setSelectedProvider(data.provider_id || '');
                if (data.commission_percent !== null) {
                    setCommissionValue(String(data.commission_percent));
                    setIsEditingCommission(false);
                } else {
                    setIsEditingCommission(true);
                }
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Alert.alert('Error', 'Failed to load booking details.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [booking?.id]);

    const loadTradespeople = useCallback(async () => {
        try {
            const res = await api.get('/api/provider?status=active');
            if (res.success) setTradespeople(res.data || []);
        } catch (error) {
            console.error('Error loading tradespeople:', error);
        }
    }, []);

    useEffect(() => {
        fetchBookingDetails();
        loadTradespeople();
    }, [fetchBookingDetails, loadTradespeople]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookingDetails(false);
    };

    const handleSaveCommission = async () => {
        const pct = parseFloat(commissionValue);
        if (isNaN(pct) || pct < 0 || pct > 100) {
            Alert.alert('Error', 'Please enter a valid percentage between 0 and 100.');
            return;
        }

        setSavingCommission(true);
        try {
            const res = await api.put(`/api/bookings?id=${currentBooking.id}`, {
                commission_percent: pct
            });

            if (res.success) {
                Alert.alert('Success', `Commission set to ${pct}%`);
                fetchBookingDetails(false);
            } else {
                Alert.alert('Error', res.message || 'Failed to update commission');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while saving commission.');
        } finally {
            setSavingCommission(false);
        }
    };

    const handleAssignProvider = async () => {
        if (!selectedProvider) {
            Alert.alert('Error', 'Please select a provider.');
            return;
        }
        if (currentBooking.commission_percent == null) {
            Alert.alert('Warning', 'Set commission first before assigning a provider.');
            return;
        }

        setUpdating(true);
        try {
            const res = await api.put(`/api/bookings?id=${currentBooking.id}`, {
                provider_id: selectedProvider,
                status: 'matching'
            });

            if (res.success) {
                Alert.alert('Success', 'Provider assigned & status set to Matching');
                setAssignModalVisible(false);
                fetchBookingDetails(false);
            } else {
                Alert.alert('Error', res.message || 'Failed to assign provider.');
            }
        } catch (error) {
            Alert.alert('Error', 'Request failed.');
        } finally {
            setUpdating(false);
        }
    };

    const handleRestartBooking = async () => {
        Alert.alert(
            'Restart Booking',
            'This will remove the current provider and reset the status to pending. Proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restart',
                    style: 'destructive',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            const res = await api.put(`/api/bookings?id=${currentBooking.id}`, {
                                provider_id: null,
                                status: 'pending'
                            });
                            if (res.success) {
                                Alert.alert('Success', 'Booking restarted successfully.');
                                fetchBookingDetails();
                            } else {
                                Alert.alert('Error', res.message || 'Failed to restart.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Request failed.');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const openViewer = (url) => {
        setSelectedImage(url);
        setViewerVisible(true);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { label: 'Pending', bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', ring: '#fde68a' };
            case 'matching': return { label: 'Matching', bg: '#fff7ed', text: '#c2410c', dot: '#f97316', ring: '#fed7aa' };
            case 'confirmed': return { label: 'Confirmed', bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', ring: '#bfdbfe' };
            case 'in_progress': return { label: 'In Progress', bg: '#f5f3ff', text: '#6d28d9', dot: '#8b5cf6', ring: '#ddd6fe' };
            case 'awaiting_approval': return { label: 'Awaiting Approval', bg: '#fefce8', text: '#a16207', dot: '#eab308', ring: '#fef08a' };
            case 'completed': return { label: 'Completed', bg: '#ecfdf5', text: '#047857', dot: '#10b981', ring: '#a7f3d0' };
            case 'disputed': return { label: 'Disputed', bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', ring: '#fecaca' };
            case 'cancelled': return { label: 'Cancelled', bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', ring: '#fecaca' };
            default: return { label: status?.toUpperCase(), bg: '#f8fafc', text: '#475569', dot: '#94a3b8', ring: '#e2e8f0' };
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    if (loading && !currentBooking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#0d9488" />
                </View>
            </SafeAreaView>
        );
    }

    if (!currentBooking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.card, { margin: 20, alignItems: 'center' }]}>
                    <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
                    <Text style={styles.errorText}>Booking not found</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const config = getStatusConfig(currentBooking.status);
    const servicePrice = parseFloat(currentBooking.service_price || 0);
    const overtimeEarnings = parseFloat(currentBooking.overtime_earnings || 0);
    const overtimeRate = parseFloat(currentBooking.additional_price || 0);
    const commissionPercent = currentBooking.commission_percent || 0;
    
    // Explicit platform fee from DB, else calculate
    const platformFee = currentBooking.platform_amount != null 
        ? parseFloat(currentBooking.platform_amount) 
        : servicePrice * (commissionPercent / 100);
        
    const providerBase = currentBooking.provider_amount || (servicePrice - (servicePrice * (commissionPercent / 100)));
    const providerTotal = parseFloat(currentBooking.final_provider_amount || (providerBase + overtimeEarnings));
    const authorizedAmount = parseFloat(currentBooking.authorized_amount || servicePrice);

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '—';
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.headerAction}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Ionicons name="arrow-back" size={28} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <Text style={styles.headerSubtitle}>#{currentBooking.booking_number || currentBooking.id}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Chat', {
                        bookingId: currentBooking.id,
                        bookingNumber: currentBooking.booking_number || currentBooking.id,
                        role: 'customer',
                        otherPartyName: `Chat: ${currentBooking.customer_first_name} & ${currentBooking.provider_name || 'Provider'}`,
                    })}
                    style={[styles.headerAction, !currentBooking.provider_id && { opacity: 0.3 }]}
                    disabled={!currentBooking.provider_id}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1e293b" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#0d9488" />
                }
            >
                {/* Status Section */}
                <View style={[styles.mainCard, { borderTopColor: config.dot, borderTopWidth: 4 }]}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.ring }]}>
                            <View style={[styles.statusDot, { backgroundColor: config.dot }]} />
                            <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
                        </View>
                        <Text style={styles.paymentStatus}>
                            {(currentBooking.payment_status || 'pending').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.serviceHeadline}>{currentBooking.service_name}</Text>
                    <Text style={styles.categoryLabel}>{currentBooking.category_name || 'Service'}</Text>
                </View>

                {/* State Banners */}
                {currentBooking.status === 'awaiting_approval' && (
                    <View style={styles.infoBanner}>
                        <Ionicons name="time" size={18} color="#b45309" />
                        <Text style={styles.infoBannerText}>Awaiting customer approval — payment held in escrow.</Text>
                    </View>
                )}
                {currentBooking.status === 'disputed' && (
                    <View style={styles.dangerBanner}>
                        <Ionicons name="warning" size={18} color="#b91c1c" />
                        <Text style={styles.dangerBannerText}>Dispute raised — restart booking to re-assign provider.</Text>
                    </View>
                )}

                {/* Commission Section */}
                <Section title="Commission" icon="cash-outline">
                    {currentBooking.commission_percent != null && !isEditingCommission ? (
                        <View style={styles.lockedCommissionBox}>
                            <View style={styles.commissionHeader}>
                                <Text style={styles.commissionMainVal}>{currentBooking.commission_percent}%</Text>
                                <View style={styles.lockedBadge}>
                                    <Ionicons name="lock-closed" size={12} color="#059669" />
                                    <Text style={styles.lockedText}>LOCKED</Text>
                                </View>
                            </View>
                            <View style={styles.revenueGrid}>
                                <View style={styles.revItem}>
                                    <Text style={styles.revLabel}>Platform Earns</Text>
                                    <Text style={[styles.revVal, { color: '#0d9488' }]}>{formatCurrency(platformFee)}</Text>
                                </View>
                                <View style={styles.revItem}>
                                    <Text style={styles.revLabel}>Provider Earns</Text>
                                    <Text style={[styles.revVal, { color: '#059669' }]}>{formatCurrency(providerTotal)}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.commissionEditBox}>
                            <Text style={styles.inputHint}>Set commission to make this job available to providers.</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.commissionInput}
                                        value={commissionValue}
                                        onChangeText={setCommissionValue}
                                        keyboardType="numeric"
                                        placeholder="e.g. 20"
                                        maxLength={4}
                                    />
                                    <Text style={styles.percentSymbol}>%</Text>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.saveBtn, (!commissionValue || savingCommission) && styles.disabledBtn]}
                                    onPress={handleSaveCommission}
                                    disabled={!commissionValue || savingCommission}
                                >
                                    {savingCommission ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Section>

                {/* Assignment & Resolution Section */}
                <Section title={currentBooking.status === 'disputed' ? "Dispute Resolution" : "Provider Assignment"} icon="person-add-outline">
                    {currentBooking.status === 'disputed' ? (
                        <View style={styles.resolutionBox}>
                            <Text style={styles.resolutionText}>The current provider will be removed and the job will return to "Pending" status.</Text>
                            <TouchableOpacity style={styles.restartBtnLarge} onPress={handleRestartBooking} disabled={updating}>
                                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.restartBtnTextLarge}>Restart Booking</Text>}
                            </TouchableOpacity>
                        </View>
                    ) : currentBooking.provider_name ? (
                        <View style={styles.assignedBox}>
                            <View style={styles.providerAvatar}>
                                <Text style={styles.avatarText}>{currentBooking.provider_name.charAt(0)}</Text>
                            </View>
                            <View style={styles.providerInfo}>
                                <Text style={styles.providerNameVal}>{currentBooking.provider_name}</Text>
                                <Text style={styles.providerSubVal}>{currentBooking.provider_email || 'No email'}</Text>
                                {currentBooking.provider_phone && <Text style={styles.providerSubVal}>📱 {currentBooking.provider_phone}</Text>}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.unassignedBox}>
                            <Text style={styles.unassignedHint}>Job is currently unassigned.</Text>
                            <TouchableOpacity 
                                style={[styles.assignBtnWide, currentBooking.commission_percent === null && styles.disabledBtn]}
                                onPress={() => setAssignModalVisible(true)}
                                disabled={currentBooking.commission_percent === null}
                            >
                                <Text style={styles.assignBtnTextWide}>
                                    {currentBooking.commission_percent === null ? "SET COMMISSION FIRST" : "ASSIGN PROVIDER MANUALLY"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Section>

                {/* Customer Info */}
                <Section title="Customer Details" icon="person-outline">
                    <View style={styles.gridRow}>
                        <InfoRow label="FULL NAME" value={`${currentBooking.customer_first_name} ${currentBooking.customer_last_name}`} half />
                        <InfoRow label="USER ID" value={`#${currentBooking.user_id || 'Guest'}`} half />
                    </View>
                    <InfoRow label="EMAIL" value={currentBooking.customer_email} isCopyable />
                    <InfoRow label="PHONE" value={currentBooking.customer_phone || 'Not provided'} />
                    <InfoRow label="ADDRESS" value={[currentBooking.address_line1, currentBooking.address_line2, currentBooking.city, currentBooking.postal_code].filter(Boolean).join(', ')} />
                </Section>

                {/* Service & Pricing */}
                <Section title="Service & Pricing" icon="hammer-outline">
                    <View style={styles.gridRow}>
                        <InfoRow label="SERVICE" value={currentBooking.service_name} half />
                        <InfoRow label="CATEGORY" value={currentBooking.category_name || '—'} half />
                    </View>
                    <View style={styles.gridRow}>
                        <InfoRow label="BASE PRICE" value={formatCurrency(servicePrice)} half />
                        <InfoRow label="OVERTIME RATE" value={overtimeRate > 0 ? `${formatCurrency(overtimeRate)}/hr` : 'Not set'} half />
                    </View>
                    <View style={styles.gridRow}>
                        <InfoRow label="STANDARD DURATION" value={currentBooking.service_duration ? `${currentBooking.service_duration} min` : '—'} half />
                        <InfoRow label="AUTHORIZED AMOUNT" value={formatCurrency(authorizedAmount)} half />
                    </View>
                </Section>

                {/* Location & Access */}
                <Section title="Location & Access" icon="location-outline">
                    <View style={styles.accessGrid}>
                        <AccessBadge label="Parking" active={currentBooking.parking_access} icon="p-circle" />
                        <AccessBadge label="Elevator" active={currentBooking.elevator_access} icon="elevator" />
                        <AccessBadge label="Pets" active={currentBooking.has_pets} icon="paw" />
                    </View>
                </Section>

                {/* Job Extras */}
                {(currentBooking.job_description || currentBooking.timing_constraints || currentBooking.instructions) && (
                    <Section title="Job Requirements" icon="document-text-outline">
                        {currentBooking.job_description && (
                            <View style={styles.descBox}>
                                <Text style={styles.descLabel}>DESCRIPTION</Text>
                                <Text style={styles.descVal}>{currentBooking.job_description}</Text>
                            </View>
                        )}
                        {currentBooking.timing_constraints && (
                            <View style={styles.timingBox}>
                                <Ionicons name="time-outline" size={16} color="#92400e" />
                                <Text style={styles.timingVal}>{currentBooking.timing_constraints}</Text>
                            </View>
                        )}
                        {currentBooking.instructions && (
                            <View style={styles.instrBox}>
                                <Ionicons name="information-circle-outline" size={16} color="#1e40af" />
                                <Text style={styles.instrVal}>{currentBooking.instructions}</Text>
                            </View>
                        )}
                    </Section>
                )}

                {/* Timeline */}
                <Section title="Status Timeline" icon="git-branch-outline">
                    {currentBooking.status_history?.length > 0 ? (
                        <View style={styles.timelineContainer}>
                            {currentBooking.status_history.map((item, i) => (
                                <View key={i} style={styles.timelineStep}>
                                    <View style={styles.timelineMarker}>
                                        <View style={[styles.timelineDot, { backgroundColor: '#0d9488' }]} />
                                        {i !== currentBooking.status_history.length - 1 && <View style={styles.timelineLine} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineStatusText}>{item.status ? item.status.replace('_', ' ').toUpperCase() : 'N/A'}</Text>
                                        <Text style={styles.timelineTime}>{new Date(item.created_at).toLocaleString()}</Text>
                                        {item.notes && <Text style={styles.timelineNotes}>{item.notes}</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No history records yet.</Text>
                    )}
                </Section>

                {/* Schedule & Timer */}
                <Section title="Schedule & Timer" icon="calendar-outline">
                    <InfoRow label="JOB DATE" value={currentBooking.job_date ? new Date(currentBooking.job_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                    <View style={styles.gridRow}>
                        <InfoRow label="ACCEPTED AT" value={formatDateTime(currentBooking.accepted_at)} half />
                        <InfoRow label="TIMER STATUS" value={currentBooking.job_timer_status || 'Not Started'} half />
                    </View>
                    <View style={styles.gridRow}>
                        <InfoRow label="START TIME" value={formatDateTime(currentBooking.start_time)} half />
                        <InfoRow label="END TIME" value={formatDateTime(currentBooking.end_time)} half />
                    </View>

                    {/* ── ACTUAL DURATION ── */}
                    {currentBooking.actual_duration_minutes > 0 && (
                        <View style={styles.actualDurationBox}>
                            <View style={styles.actualDurationLeft}>
                                <Ionicons name="timer-outline" size={18} color="#0d9488" />
                                <Text style={styles.actualDurationLabel}>ACTUAL DURATION</Text>
                            </View>
                            <View style={styles.actualDurationRight}>
                                <Text style={styles.actualDurationVal}>
                                    {currentBooking.actual_duration_minutes} min
                                </Text>
                                {(currentBooking.standard_duration_minutes || currentBooking.service_duration) && (
                                    <Text style={styles.actualDurationStd}>
                                        standard: {currentBooking.standard_duration_minutes || currentBooking.service_duration} min
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </Section>

                {/* Pricing Info */}
                <Section title="Financial Breakdown" icon="stats-chart-outline">
                    <FinancialRow label="Service Base Price" value={formatCurrency(servicePrice)} />
                    {currentBooking.commission_percent != null && (
                        <>
                            <FinancialRow label={`Platform Fee (${currentBooking.commission_percent}%)`} value={`-${formatCurrency(platformFee)}`} isNegative />
                            <FinancialRow label="Provider Base Amount" value={formatCurrency(providerBase)} />
                        </>
                    )}
                    {overtimeEarnings > 0 && (
                        <FinancialRow label="Overtime / Add-ons" value={formatCurrency(overtimeEarnings)} />
                    )}
                    <View style={styles.totalFinancialRow}>
                        <View>
                            <Text style={styles.totalFinLabel}>Provider Total (Final)</Text>
                            <Text style={styles.totalFinVal}>{formatCurrency(providerTotal)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.totalFinLabel}>Customer Charged</Text>
                            <Text style={[styles.totalFinVal, { color: '#1e293b' }]}>{formatCurrency(authorizedAmount)}</Text>
                        </View>
                    </View>
                    {currentBooking.payment_intent_id && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                            <Text style={styles.infoLabel}>STRIPE PAYMENT INTENT ID</Text>
                            <Text style={[styles.infoVal, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11 }]}>{currentBooking.payment_intent_id}</Text>
                        </View>
                    )}
                </Section>

                {/* Booking Meta */}
                <Section title="Booking Meta" icon="information-circle-outline">
                    <View style={styles.gridRow}>
                        <InfoRow label="BOOKING ID" value={`#${currentBooking.id}`} half />
                        <InfoRow label="SERVICE ID" value={`#${currentBooking.service_id}`} half />
                    </View>
                    <View style={styles.gridRow}>
                        <InfoRow label="CREATED" value={formatDateTime(currentBooking.created_at)} half />
                        <InfoRow label="LAST UPDATED" value={formatDateTime(currentBooking.updated_at)} half />
                    </View>
                </Section>

                {/* Photos */}
                {(currentBooking.before_photos?.length > 0 || currentBooking.after_photos?.length > 0 || currentBooking.photos?.length > 0) && (
                    <Section title="Job Photos" icon="images-outline">
                        <PhotoGrid label="BEFORE" photos={currentBooking.before_photos} onOpen={openViewer} />
                        <PhotoGrid label="AFTER" photos={currentBooking.after_photos} onOpen={openViewer} />
                        <PhotoGrid label="CUSTOMER UPLOADS" photos={currentBooking.photos} onOpen={openViewer} />
                    </Section>
                )}

            </ScrollView>

            {/* Assignment Modal */}
            <Modal
                visible={assignModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.assignModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Assign Provider</Text>
                            <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={tradespeople}
                            keyExtractor={(p) => p.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.providerItem, selectedProvider === item.id && styles.selectedProviderItem]}
                                    onPress={() => setSelectedProvider(item.id)}
                                >
                                    <View style={styles.providerAvatarSmall}>
                                        <Text style={styles.avatarTextSmall}>{item.name?.charAt(0) || 'P'}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.pItemName}>{item.name || `${item.first_name} ${item.last_name}`}</Text>
                                        <Text style={styles.pItemEmail}>{item.email}</Text>
                                    </View>
                                    {item.rating && <Text style={styles.pItemRating}>⭐ {parseFloat(item.rating).toFixed(1)}</Text>}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>No active providers found.</Text>}
                            style={{ maxHeight: 400 }}
                        />
                        <TouchableOpacity 
                            style={[styles.confirmAssignBtn, (!selectedProvider || updating) && styles.disabledBtn]}
                            onPress={handleAssignProvider}
                            disabled={!selectedProvider || updating}
                        >
                            {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmAssignBtnText}>Confirm Assignment</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ImageViewer Modal */}
            <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
                <View style={styles.viewerContainer}>
                    <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerVisible(false)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                    <Image 
                        source={{ uri: (() => {
                            const raw = selectedImage.url || selectedImage;
                            return raw?.startsWith('http') ? raw : `${API_BASE_URL}${raw}`;
                        })() }} 
                        style={styles.viewerImg} 
                        resizeMode="contain" 
                    />)}
                </View>
            </Modal>
        </View>
    );
};

// Reusable Components
const Section = ({ title, icon, children }) => (
    <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={18} color="#64748b" />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.card}>{children}</View>
    </View>
);

const InfoRow = ({ label, value, isCopyable, half }) => (
    <View style={[styles.infoRow, half && { flex: 1 }]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoVal} numberOfLines={half ? 1 : 3}>{value || '—'}</Text>
    </View>
);

const AccessBadge = ({ label, active, icon }) => (
    <View style={[styles.accessBadge, active ? styles.accessBadgeActive : styles.accessBadgeInactive]}>
        <Ionicons name={active ? "checkmark-circle" : "close-circle"} size={14} color={active ? "#059669" : "#94a3b8"} />
        <Text style={[styles.accessBadgeText, active ? styles.accessBadgeTextActive : styles.accessBadgeTextInactive]}>{label}</Text>
    </View>
);

const FinancialRow = ({ label, value, isNegative }) => (
    <View style={styles.finRow}>
        <Text style={styles.finLabel}>{label}</Text>
        <Text style={[styles.finVal, isNegative && { color: '#ef4444' }]}>{value}</Text>
    </View>
);

const PhotoGrid = ({ label, photos, onOpen }) => {
    if (!photos?.length) return null;
    return (
        <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>{label} ({photos.length})</Text>
            <View style={styles.pGrid}>
                {photos.map((p, i) => {
                    const rawUrl = p.url || p;
                    const uri = rawUrl?.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
                    return (
                        <TouchableOpacity key={i} onPress={() => onOpen(p)}>
                            <Image source={{ uri }} style={styles.pMini} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerAction: { width: 60, alignItems: 'center', paddingLeft: 10, alignSelf: 'stretch', justifyContent: 'center' },
    headerTitleContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 },

    scrollContent: { padding: 16, paddingBottom: 40 },

    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    paymentStatus: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
    serviceHeadline: { fontSize: 24, fontWeight: '900', color: '#0f172a', textAlign: 'center' },
    categoryLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 4 },

    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    infoBannerText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#92400e', fontWeight: '600' },
    dangerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    dangerBannerText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#b91c1c', fontWeight: '600' },

    sectionContainer: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 4 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },

    lockedCommissionBox: { gap: 12 },
    commissionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    commissionMainVal: { fontSize: 28, fontWeight: '900', color: '#059669' },
    lockedBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#ecfdf5', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1fae5'
    },
    lockedText: { fontSize: 10, fontWeight: '800', color: '#059669', marginLeft: 4 },
    revenueGrid: { flexDirection: 'row', gap: 12 },
    revItem: { flex: 1, backgroundColor: '#f8fafc', padding: 12, borderRadius: 16 },
    revLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    revVal: { fontSize: 16, fontWeight: '800' },

    commissionEditBox: { gap: 12 },
    inputHint: { fontSize: 12, color: '#64748b', lineHeight: 18 },
    inputRow: { flexDirection: 'row', gap: 12 },
    inputWrapper: { flex: 1, position: 'relative' },
    commissionInput: {
        height: 50,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b'
    },
    percentSymbol: { position: 'absolute', right: 16, top: 14, fontSize: 16, fontWeight: '700', color: '#94a3b8' },
    saveBtn: { 
        width: 80, 
        height: 50, 
        backgroundColor: '#0d9488', 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    disabledBtn: { opacity: 0.5 },

    resolutionBox: { gap: 12 },
    resolutionText: { fontSize: 12, color: '#b91c1c', fontWeight: '500', lineHeight: 18 },
    restartBtnLarge: { backgroundColor: '#4f46e5', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    restartBtnTextLarge: { color: '#fff', fontWeight: '800', fontSize: 14 },

    assignedBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    providerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
    providerInfo: { flex: 1 },
    providerNameVal: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    providerSubVal: { fontSize: 12, color: '#64748b', marginTop: 2 },

    unassignedBox: { gap: 12 },
    unassignedHint: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
    assignBtnWide: { height: 50, backgroundColor: '#0d9488', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    assignBtnTextWide: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

    infoRow: { marginBottom: 12, paddingRight: 8 },
    infoLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 },
    infoVal: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
    gridRow: { flexDirection: 'row', gap: 12 },

    accessGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    accessBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, gap: 6 },
    accessBadgeActive: { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' },
    accessBadgeInactive: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
    accessBadgeText: { fontSize: 11, fontWeight: '700' },
    accessBadgeTextActive: { color: '#059669' },
    accessBadgeTextInactive: { color: '#64748b' },

    descBox: { marginBottom: 16 },
    descLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 6 },
    descVal: { fontSize: 13, color: '#334155', lineHeight: 20 },
    timingBox: { flexDirection: 'row', gap: 8, backgroundColor: '#fffbeb', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
    timingVal: { fontSize: 11, color: '#92400e', fontWeight: '600' },
    instrBox: { flexDirection: 'row', gap: 8, backgroundColor: '#eff6ff', padding: 10, borderRadius: 12, alignItems: 'center' },
    instrVal: { fontSize: 11, color: '#1e40af', fontWeight: '600' },

    timelineContainer: { borderLeftWidth: 2, borderLeftColor: '#f1f5f9', marginLeft: 8, paddingLeft: 20 },
    timelineStep: { marginBottom: 20 },
    timelineMarker: { position: 'absolute', left: -27, top: 4, alignItems: 'center' },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0d9488' },
    timelineLine: { width: 2, height: 40, backgroundColor: '#f1f5f9' },
    timelineStatusText: { fontSize: 11, fontWeight: '800', color: '#1e293b' },
    timelineTime: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
    timelineNotes: { fontSize: 10, color: '#64748b', fontStyle: 'italic', marginTop: 4 },

    // ── Actual Duration styles ──
    actualDurationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#f0fdfa',
        borderWidth: 1,
        borderColor: '#99f6e4',
        borderRadius: 14,
    },
    actualDurationLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actualDurationLabel: { fontSize: 11, fontWeight: '800', color: '#0f766e', letterSpacing: 0.4 },
    actualDurationRight: { alignItems: 'flex-end' },
    actualDurationVal: { fontSize: 15, fontWeight: '900', color: '#0d9488' },
    actualDurationStd: { fontSize: 10, color: '#5eead4', marginTop: 2 },

    finRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    finLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    finVal: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
    totalFinancialRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    totalFinLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    totalFinVal: { fontSize: 16, fontWeight: '900', color: '#0d9488' },

    photoSection: { marginBottom: 16 },
    photoLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', marginBottom: 10 },
    pGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pMini: { width: (width - 80) / 4, height: (width - 80) / 4, borderRadius: 12, backgroundColor: '#f1f5f9' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    assignModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    providerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    selectedProviderItem: { borderColor: '#0d9488', backgroundColor: '#f0fdfa' },
    providerAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center' },
    avatarTextSmall: { color: '#fff', fontSize: 14, fontWeight: '800' },
    pItemName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    pItemEmail: { fontSize: 11, color: '#64748b' },
    pItemRating: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
    confirmAssignBtn: { height: 50, backgroundColor: '#0d9488', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    confirmAssignBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    viewerClose: { position: 'absolute', top: 50, right: 20, padding: 10 },
    viewerImg: { width: width, height: width * 1.5 },

    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#64748b' },
    backBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#0d9488', borderRadius: 12 },
    backBtnText: { color: '#fff', fontWeight: '800' },
    emptyText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
});

export default AdminJobDetailsScreen;