import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '../../utils/responsive';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';

const BookingSuccessScreen = ({ navigation, route }) => {
    const { bookingNumber, bookingId } = route.params || {};

    const handleDownloadInvoice = () => {
        if (!bookingId) return;
        const url = `${API_BASE_URL}/api/bookings/${bookingId}/invoice/download`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark-circle" size={moderateScale(80)} color={PRIMARY} />
                </View>
                
                <Text style={styles.title}>Booking Confirmed!</Text>
                <Text style={styles.subtitle}>
                    Your service has been scheduled successfully.
                </Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Booking Number</Text>
                    <Text style={styles.infoValue}>{bookingNumber || 'BK-PENDING'}</Text>
                    
                    <TouchableOpacity 
                        style={styles.downloadRow} 
                        onPress={handleDownloadInvoice}
                    >
                        <Ionicons name="download-outline" size={18} color={PRIMARY} />
                        <Text style={styles.downloadText}>Download Invoice/Receipt</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.btnPrimary} 
                    onPress={() => navigation.navigate('Main', { screen: 'MyBookings' })}
                >
                    <Text style={styles.btnText}>View My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.btnSecondary} 
                    onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
                >
                    <Text style={styles.btnTextSecondary}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: moderateScale(30) },
    iconCircle: { marginBottom: verticalScale(30) },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(10) },
    subtitle: { fontSize: moderateScale(16), color: '#64748b', textAlign: 'center', marginBottom: verticalScale(40) },
    infoCard: {
        width: '100%',
        padding: moderateScale(20),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(40),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoLabel: { fontSize: moderateScale(12), color: '#94a3b8', textTransform: 'uppercase', marginBottom: verticalScale(5) },
    infoValue: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#1e293b', marginBottom: verticalScale(10) },
    downloadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0fdfa',
        borderRadius: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#ccfbf1',
    },
    downloadText: {
        color: PRIMARY,
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginLeft: 8,
    },
    btnPrimary: {
        width: '100%',
        paddingVertical: verticalScale(16),
        backgroundColor: PRIMARY,
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    btnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
    btnSecondary: {
        width: '100%',
        paddingVertical: verticalScale(16),
        alignItems: 'center',
    },
    btnTextSecondary: { color: PRIMARY, fontSize: moderateScale(16), fontWeight: 'bold' },
});

export default BookingSuccessScreen;
