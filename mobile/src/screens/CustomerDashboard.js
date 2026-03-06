import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ImageBackground
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const CustomerDashboard = ({ navigation }) => {
    const { user } = useAuth();

    const ServiceCategory = ({ title, icon, color }) => (
        <TouchableOpacity style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: color + '15' }]}>
                <Text style={{ fontSize: moderateScale(28) }}>{icon}</Text>
            </View>
            <Text style={styles.categoryTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello,</Text>
                        <Text style={styles.nameText}>{user?.first_name || 'Customer'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.first_name?.charAt(0) || 'C'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Text style={styles.searchPlaceholder}>🔍 Search for services...</Text>
                </View>

                <View style={styles.promoCard}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Get 20% OFF</Text>
                        <Text style={styles.promoSubtitle}>On your first plumbing service</Text>
                        <TouchableOpacity style={styles.promoButton}>
                            <Text style={styles.promoButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.promoExtra}>🎁</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                        <Text style={styles.viewAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    <ServiceCategory title="Plumbing" icon="🚰" color="#3b82f6" />
                    <ServiceCategory title="Electric" icon="⚡" color="#f59e0b" />
                    <ServiceCategory title="Cleaning" icon="🧹" color="#10b981" />
                    <ServiceCategory title="Painting" icon="🎨" color="#ec4899" />
                    <ServiceCategory title="Carpentry" icon="🪑" color="#8b5cf6" />
                    <ServiceCategory title="AC Repair" icon="❄️" color="#06b6d4" />
                </View>

                <View style={styles.recentBookings}>
                    <Text style={styles.sectionTitle}>My Bookings</Text>
                    <View style={styles.emptyBookings}>
                        <Text style={styles.emptyText}>You have no active bookings.</Text>
                        <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.bookNowText}>Book a Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: moderateScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: moderateScale(16),
        color: '#64748b',
    },
    nameText: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatar: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    searchBar: {
        marginHorizontal: moderateScale(20),
        marginVertical: verticalScale(20),
        backgroundColor: '#f1f5f9',
        padding: moderateScale(15),
        borderRadius: moderateScale(15),
    },
    searchPlaceholder: {
        color: '#94a3b8',
        fontSize: moderateScale(16),
    },
    promoCard: {
        marginHorizontal: moderateScale(20),
        backgroundColor: '#115e59',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        color: '#fff',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    promoSubtitle: {
        color: '#ccfbf1',
        fontSize: moderateScale(14),
        marginTop: verticalScale(4),
        marginBottom: verticalScale(16),
    },
    promoButton: {
        backgroundColor: '#fff',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(12),
        alignSelf: 'flex-start',
    },
    promoButtonText: {
        color: '#115e59',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    promoExtra: {
        fontSize: moderateScale(60),
    },
    sectionHeader: {
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    viewAllText: {
        color: '#14b8a6',
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: moderateScale(10),
        marginBottom: verticalScale(20),
    },
    categoryItem: {
        width: (SCREEN_WIDTH - moderateScale(20)) / 3,
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    categoryIcon: {
        width: moderateScale(65),
        height: moderateScale(65),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    categoryTitle: {
        fontSize: moderateScale(13),
        fontWeight: '500',
        color: '#475569',
    },
    recentBookings: {
        paddingHorizontal: moderateScale(20),
        marginBottom: verticalScale(30),
    },
    emptyBookings: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(20),
        padding: moderateScale(30),
        alignItems: 'center',
        marginTop: verticalScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: moderateScale(16),
        marginBottom: verticalScale(16),
    },
    bookNowButton: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: moderateScale(24),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
    },
    bookNowText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default CustomerDashboard;
