import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

const DetailsScreen = ({ navigation, route }) => {
    const { service, bookingId } = route.params || {};
    const [data, setData] = useState(service || null);
    const [loading, setLoading] = useState(!service);

    useEffect(() => {
        if (bookingId && !service) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const res = await apiService.customer.getBookingDetails(bookingId);
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#14b8a6" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Details not found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isService = !!service;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {data.image_url ? (
                    <Image source={{ uri: data.image_url }} style={styles.imageConfig} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="construct-outline" size={moderateScale(60)} color="#cbd5e1" />
                    </View>
                )}
                
                <View style={styles.content}>
                    <Text style={styles.title}>{data.name || data.service_name || 'Service Details'}</Text>
                    {isService && <Text style={styles.price}>${data.price}</Text>}
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {data.description || data.summary || 'No detailed description provided for this item.'}
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                {isService && (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => alert('Booking flow coming soon!')}>
                        <Text style={styles.primaryButtonText}>Book Now</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: moderateScale(16),
        color: '#64748b',
        marginBottom: verticalScale(16),
    },
    imageConfig: {
        width: '100%',
        height: verticalScale(250),
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: verticalScale(250),
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: moderateScale(20),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(8),
    },
    price: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#14b8a6',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: verticalScale(20),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: verticalScale(10),
    },
    description: {
        fontSize: moderateScale(15),
        color: '#64748b',
        lineHeight: moderateScale(24),
    },
    footer: {
        flexDirection: 'row',
        padding: moderateScale(20),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        marginRight: scale(10),
    },
    secondaryButtonText: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#475569',
    },
    primaryButton: {
        flex: 2,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
        backgroundColor: '#115e59',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: moderateScale(24),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
    },
    backButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});

export default DetailsScreen;
