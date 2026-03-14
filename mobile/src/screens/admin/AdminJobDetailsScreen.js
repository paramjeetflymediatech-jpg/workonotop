import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const AdminJobDetailsScreen = ({ navigation, route }) => {
    const { booking } = route.params || {};

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
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const statusStyle = getStatusStyle(booking.status);
    const servicePrice = parseFloat(booking.service_price || 0);
    const additionalPrice = parseFloat(booking.additional_price || 0);
    const totalAmount = servicePrice + additionalPrice;

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
                    <Text style={styles.bookingNumber}>#{booking.booking_number || booking.id}</Text>
                    <Text style={styles.serviceName}>{booking.service_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {booking.status?.replace('_', ' ')}
                        </Text>
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
                                <Text style={styles.detailValue}>{booking.customer_first_name} {booking.customer_last_name}</Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="call" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Phone Number</Text>
                                <Text style={styles.detailValue}>{booking.customer_phone || 'Not provided'}</Text>
                            </View>
                        </View>
                        {booking.customer_email && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="mail" size={moderateScale(20)} color="#115e59" />
                                    </View>
                                    <View style={styles.detailInfo}>
                                        <Text style={styles.detailLabel}>Email</Text>
                                        <Text style={styles.detailValue}>{booking.customer_email}</Text>
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
                                <Text style={styles.detailValue}>{new Date(booking.job_date).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="location" size={moderateScale(20)} color="#115e59" />
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={styles.detailValue}>{booking.address_line1}, {booking.city}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing Information</Text>
                    <View style={styles.card}>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Service Price</Text>
                            <Text style={styles.pricingValue}>{formatCurrency(servicePrice)}</Text>
                        </View>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Additional Price</Text>
                            <Text style={styles.pricingValue}>{formatCurrency(additionalPrice)}</Text>
                        </View>
                        <View style={[styles.pricingRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
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
    }
});

export default AdminJobDetailsScreen;
