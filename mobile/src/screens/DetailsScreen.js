import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';

const DetailsScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const { service, bookingId } = route.params || {};
    const [data, setData] = useState(service || null);
    const [loading, setLoading] = useState(!service);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (bookingId && !service) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await apiService.customer.getBookingDetails(bookingId, user?.id, user?.token);
            if (res && res.data) {
                // Backend returns an array [booking], take the first one
                const bookingData = Array.isArray(res.data) ? res.data[0] : res.data;
                setData(bookingData);
            }
        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        if (bookingId) {
            setRefreshing(true);
            fetchBookingDetails();
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#115e59" />
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
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    bookingId ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" /> : null
                }
            >
                {(data.image_url || data.service_image) ? (
                    <Image 
                        source={{ 
                            uri: (data.image_url || data.service_image).startsWith('http') 
                                ? (data.image_url || data.service_image) 
                                : `${API_BASE_URL}${data.image_url || data.service_image}` 
                        }} 
                        style={styles.imageConfig} 
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="construct-outline" size={moderateScale(60)} color="#cbd5e1" />
                    </View>
                )}
                
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{data.name || data.service_name || 'Service Details'}</Text>
                        <View style={styles.badgeRow}>
                            {data.is_trending === 1 && <View style={[styles.miniBadge, { backgroundColor: '#fef3c7' }]}><Text style={[styles.miniBadgeText, { color: '#d97706' }]}>Trending</Text></View>}
                            {data.is_popular === 1 && <View style={[styles.miniBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.miniBadgeText, { color: '#16a34a' }]}>Popular</Text></View>}
                            {data.is_homepage === 1 && <View style={[styles.miniBadge, { backgroundColor: '#eff6ff' }]}><Text style={[styles.miniBadgeText, { color: '#3b82f6' }]}>Home</Text></View>}
                        </View>
                    </View>

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Base Price</Text>
                            <Text style={styles.price}>${data.base_price || data.price || '0.00'}</Text>
                        </View>
                        {data.additional_price > 0 && (
                            <View style={styles.priceDivider}>
                                <Text style={styles.priceLabel}>Additional</Text>
                                <Text style={styles.price}>+${data.additional_price}</Text>
                            </View>
                        )}
                        <View style={styles.priceDivider}>
                            <Text style={styles.priceLabel}>Duration</Text>
                            <Text style={styles.metaValue}>{data.duration_minutes || 'Flexible'} min</Text>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Short Description</Text>
                    <Text style={styles.description}>
                        {data.short_description || 'No short description provided.'}
                    </Text>

                    <View style={styles.spacer} />

                    <Text style={styles.sectionTitle}>Full Description</Text>
                    <Text style={styles.description}>
                        {data.description || data.summary || 'No detailed description provided.'}
                    </Text>

                    {data.use_cases && (
                        <>
                            <View style={styles.spacer} />
                            <Text style={styles.sectionTitle}>Common Use Cases</Text>
                            <View style={styles.useCaseContainer}>
                                {data.use_cases.split(',').map((item, index) => (
                                    <View key={index} style={styles.useCaseBadge}>
                                        <Text style={styles.useCaseText}>{item.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, moderateScale(20)) }]}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                {isService && data.is_active !== 0 && !route.params?.hideBooking && (
                    <TouchableOpacity 
                        style={styles.primaryButton} 
                        onPress={() => {
                            if (!user) {
                                // Guest tries to book -> Redirect to Auth
                                navigation.navigate('AuthChoice', { 
                                    initialState: 'login',
                                    redirectTo: 'CreateBooking',
                                    redirectParams: { service: data }
                                });
                            } else {
                                navigation.navigate('CreateBooking', { service: data });
                            }
                        }}
                    >
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(15),
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flex: 1,
    },
    miniBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(6),
        marginLeft: scale(5),
        marginBottom: verticalScale(5),
    },
    miniBadgeText: {
        fontSize: moderateScale(10),
        fontWeight: 'bold',
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        flex: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: moderateScale(15),
        borderRadius: moderateScale(12),
    },
    priceLabel: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginBottom: verticalScale(2),
    },
    price: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#115e59',
    },
    priceDivider: {
        marginLeft: scale(25),
        paddingLeft: scale(25),
        borderLeftWidth: 1,
        borderLeftColor: '#e2e8f0',
    },
    metaValue: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: verticalScale(20),
    },
    spacer: {
        height: verticalScale(20),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: verticalScale(8),
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: moderateScale(15),
        color: '#475569',
        lineHeight: moderateScale(22),
    },
    useCaseContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(5),
    },
    useCaseBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        marginRight: scale(8),
        marginBottom: verticalScale(8),
    },
    useCaseText: {
        fontSize: moderateScale(13),
        color: '#475569',
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
