import React from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, Image, StatusBar, Modal, Dimensions,
    TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const AdminJobDetailsScreen = ({ navigation, route }) => {
    const { booking } = route.params || {};
    const [viewerVisible, setViewerVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(null);

    const openViewer = (url) => {
        setSelectedImage(url);
        setViewerVisible(true);
    };

    const [currentBooking, setCurrentBooking] = React.useState(booking);
    const [commissionValue, setCommissionValue] = React.useState(
        booking.commission_percent !== null ? String(booking.commission_percent) : ''
    );
    const [isEditingCommission, setIsEditingCommission] = React.useState(booking.commission_percent === null);
    const [savingCommission, setSavingCommission] = React.useState(false);

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
                // Update local state
                const updatedBooking = { 
                    ...currentBooking, 
                    commission_percent: pct,
                    provider_amount: currentBooking.service_price * (1 - pct / 100)
                };
                setCurrentBooking(updatedBooking);
                setIsEditingCommission(false);
            } else {
                Alert.alert('Error', res.message || 'Failed to update commission');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred while saving commission.');
        } finally {
            setSavingCommission(false);
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

    if (!booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Booking details not found.</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea' };
            case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const statusStyle = getStatusStyle(booking.status);
    const servicePrice = parseFloat(booking.service_price || 0);
    const overtimeEarnings = parseFloat(booking.overtime_earnings || 0);
    const totalAmount = servicePrice + overtimeEarnings;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonIcon}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <View style={{ width: moderateScale(24) }} /> {/* Spacer */}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.mainInfoCard}>
                    <Text style={styles.bookingNumber}>#{currentBooking.booking_number || currentBooking.id}</Text>
                    <Text style={styles.serviceName}>{currentBooking.service_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {currentBooking.status?.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                {/* Commission Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commission Setup</Text>
                    <View style={styles.card}>
                        <View style={styles.commissionHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="card" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Platform Commission</Text>
                                {currentBooking.commission_percent !== null && !isEditingCommission ? (
                                    <Text style={styles.commissionValueText}>{currentBooking.commission_percent}%</Text>
                                ) : (
                                    <Text style={styles.commissionPlaceholder}>Not set yet</Text>
                                )}
                            </View>
                            {currentBooking.commission_percent !== null && !isEditingCommission && (
                                <TouchableOpacity 
                                    style={styles.editBtn}
                                    onPress={() => setIsEditingCommission(true)}
                                >
                                    <Ionicons name="create-outline" size={moderateScale(20)} color="#115e59" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {isEditingCommission ? (
                            <View style={styles.commissionEditContainer}>
                                <Text style={styles.inputLabel}>Enter Commission Percentage (%)</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.commissionInput}
                                        value={commissionValue}
                                        onChangeText={setCommissionValue}
                                        keyboardType="numeric"
                                        placeholder="e.g. 20"
                                        maxLength={5}
                                    />
                                    <TouchableOpacity 
                                        style={[styles.saveBtn, savingCommission && styles.disabledBtn]}
                                        onPress={handleSaveCommission}
                                        disabled={savingCommission}
                                    >
                                        {savingCommission ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.saveBtnText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                    {currentBooking.commission_percent !== null && (
                                        <TouchableOpacity 
                                            style={styles.cancelBtn}
                                            onPress={() => {
                                                setIsEditingCommission(false);
                                                setCommissionValue(String(currentBooking.commission_percent));
                                            }}
                                        >
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.commissionHint}>
                                    Setting this will make the job visible to providers in "Available Jobs".
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.commissionSummary}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Platform Earns:</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatCurrency(currentBooking.service_price * (currentBooking.commission_percent / 100))}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Provider Earns:</Text>
                                    <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                                        {formatCurrency(currentBooking.provider_amount || (currentBooking.service_price * (1 - currentBooking.commission_percent / 100)))}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.card}>
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="person" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Full Name</Text>
                                <Text style={styles.detailValue}>{currentBooking.customer_first_name} {currentBooking.customer_last_name}</Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="call" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Phone Number</Text>
                                <Text style={styles.detailValue}>{currentBooking.customer_phone || 'Not provided'}</Text>
                            </View>
                        </View>
                        {!!currentBooking.customer_email && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="mail" size={moderateScale(20)} color="#115e59" />
                                    </View>
                                    <View style={styles.detailInfo}>
                                        <Text style={styles.detailLabel}>Email</Text>
                                        <Text style={styles.detailValue}>{currentBooking.customer_email}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Details</Text>
                    <View style={styles.card}>
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="calendar" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{new Date(currentBooking.job_date).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="location" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={styles.detailValue}>{currentBooking.address_line1}, {currentBooking.city}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {!!currentBooking.job_description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <View style={styles.card}>
                            <Text style={styles.descriptionText}>{currentBooking.job_description}</Text>
                        </View>
                    </View>
                )}

                {!!(currentBooking.timing_constraints || currentBooking.instructions) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Extra Details</Text>
                        <View style={styles.card}>
                            {!!currentBooking.timing_constraints && (
                                <View style={styles.detailItemCompact}>
                                    <Ionicons name="hourglass-outline" size={moderateScale(18)} color="#64748b" />
                                    <View style={{ marginLeft: scale(10), flex: 1 }}>
                                        <Text style={styles.labelSmall}>Timing Constraints</Text>
                                        <Text style={styles.extraText}>{currentBooking.timing_constraints}</Text>
                                    </View>
                                </View>
                            )}
                            {!!currentBooking.instructions && (
                                <View style={[styles.detailItemCompact, { marginTop: 10 }]}>
                                    <Ionicons name="information-circle-outline" size={moderateScale(18)} color="#64748b" />
                                    <View style={{ marginLeft: scale(10), flex: 1 }}>
                                        <Text style={styles.labelSmall}>Special Instructions</Text>
                                        <Text style={styles.extraText}>{currentBooking.instructions}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Access & Amenities</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, currentBooking.parking_access && styles.badgeActive]}>
                            <Ionicons name="car-outline" size={12} color={currentBooking.parking_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, currentBooking.parking_access && styles.badgeTextActive]}>Parking</Text>
                        </View>
                        <View style={[styles.badge, currentBooking.elevator_access && styles.badgeActive]}>
                            <Ionicons name="business-outline" size={12} color={currentBooking.elevator_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, currentBooking.elevator_access && styles.badgeTextActive]}>Elevator</Text>
                        </View>
                        <View style={[styles.badge, currentBooking.has_pets && styles.badgeActive]}>
                            <Ionicons name="paw-outline" size={12} color={currentBooking.has_pets ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, currentBooking.has_pets && styles.badgeTextActive]}>Pets</Text>
                        </View>
                    </View>
                </View>

                {currentBooking.photos && currentBooking.photos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Job Photos</Text>
                        <View style={styles.photoGrid}>
                            {currentBooking.photos.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => openViewer(url)}>
                                    <Image source={{ uri: url }} style={styles.photoMini} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing Information</Text>
                    <View style={styles.card}>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Service Price</Text>
                            <Text style={styles.pricingValue}>{formatCurrency(servicePrice)}</Text>
                        </View>
                        {currentBooking.commission_percent !== null && (
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Platform Commission ({currentBooking.commission_percent}%)</Text>
                                <Text style={[styles.pricingValue, { color: '#dc2626' }]}>
                                    -{formatCurrency(servicePrice * (currentBooking.commission_percent / 100))}
                                </Text>
                            </View>
                        )}
                        {overtimeEarnings > 0 && (
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Additional Earnings</Text>
                                <Text style={styles.pricingValue}>{formatCurrency(overtimeEarnings)}</Text>
                            </View>
                        )}
                        <View style={[styles.pricingRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Provider Total</Text>
                            <Text style={styles.totalValue}>
                                {formatCurrency((currentBooking.provider_amount || (servicePrice * (1 - (currentBooking.commission_percent || 0) / 100))) + overtimeEarnings)}
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginTop: verticalScale(20),
    },
    backButtonIcon: {
        padding: scale(5),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        padding: scale(20),
        paddingBottom: verticalScale(40),
    },
    mainInfoCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(20),
        marginBottom: verticalScale(20),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    bookingNumber: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: verticalScale(5),
    },
    serviceName: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(15),
        textAlign: 'center',
    },
    statusBadge: {
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
    },
    statusText: {
        fontSize: moderateScale(12),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: verticalScale(25),
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: verticalScale(10),
        marginLeft: scale(5),
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    detailInfo: {
        flex: 1,
    },
    detailLabel: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginBottom: verticalScale(2),
    },
    detailValue: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#0f172a',
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: verticalScale(12),
        marginLeft: scale(55), // Align with text
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    pricingLabel: {
        fontSize: moderateScale(15),
        color: '#475569',
    },
    pricingValue: {
        fontSize: moderateScale(15),
        color: '#0f172a',
        fontWeight: '600',
    },
    totalRow: {
        marginTop: verticalScale(8),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    totalLabel: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    totalValue: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#115e59',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: moderateScale(16),
        color: '#64748b',
        marginBottom: verticalScale(20),
    },
    backButton: {
        backgroundColor: '#115e59',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    /* Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: verticalScale(50),
        right: scale(20),
        zIndex: 10,
        padding: scale(10),
    },
    viewerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },
    /* Description & Extra */
    descriptionText: {
        fontSize: moderateScale(15),
        color: '#334155',
        lineHeight: verticalScale(22),
    },
    detailItemCompact: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    labelSmall: {
        fontSize: moderateScale(12),
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: verticalScale(2),
        textTransform: 'uppercase',
    },
    extraText: {
        fontSize: moderateScale(14),
        color: '#1e293b',
        lineHeight: verticalScale(20),
    },
    /* Badge Styles */
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(8),
        marginTop: verticalScale(5),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    badgeActive: {
        backgroundColor: '#115e59',
        borderColor: '#115e59',
    },
    badgeText: {
        marginLeft: scale(4),
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#64748b',
    },
    badgeTextActive: {
        color: '#fff',
    },
    /* Photo Grid */
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(10),
        marginTop: verticalScale(5),
    },
    photoMini: {
        width: moderateScale(70),
        height: moderateScale(70),
        borderRadius: moderateScale(12),
        backgroundColor: '#f1f5f9',
    },
    /* Commission Styles */
    commissionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commissionValueText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#115e59',
    },
    commissionPlaceholder: {
        fontSize: moderateScale(15),
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    editBtn: {
        padding: scale(5),
    },
    commissionEditContainer: {
        marginTop: verticalScale(15),
        paddingTop: verticalScale(15),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    inputLabel: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginBottom: verticalScale(8),
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commissionInput: {
        flex: 1,
        height: verticalScale(45),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(12),
        fontSize: moderateScale(16),
        color: '#0f172a',
        backgroundColor: '#f8fafc',
    },
    saveBtn: {
        backgroundColor: '#115e59',
        height: verticalScale(45),
        paddingHorizontal: scale(20),
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(10),
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    cancelBtn: {
        paddingHorizontal: scale(10),
        marginLeft: scale(5),
    },
    cancelBtnText: {
        color: '#64748b',
        fontSize: moderateScale(14),
    },
    disabledBtn: {
        opacity: 0.7,
    },
    commissionHint: {
        fontSize: moderateScale(11),
        color: '#d97706',
        marginTop: verticalScale(8),
        fontStyle: 'italic',
    },
    commissionSummary: {
        marginTop: verticalScale(15),
        paddingTop: verticalScale(15),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(5),
    },
    summaryLabel: {
        fontSize: moderateScale(14),
        color: '#64748b',
    },
    summaryValue: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#0f172a',
    },
});

export default AdminJobDetailsScreen;
