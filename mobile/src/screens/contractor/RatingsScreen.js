import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';
const GOLD = '#f59e0b';

const RatingsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchRatings = useCallback(async () => {
        try {
            const res = await apiService.get('/api/provider/ratings', {}, user?.token);
            if (res?.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Ratings fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token]);

    useEffect(() => { fetchRatings(); }, [fetchRatings]);

    const onRefresh = () => { setRefreshing(true); fetchRatings(); };

    const stats = data?.stats || { average_rating: 0, total_reviews: 0, distribution: {} };
    const reviews = data?.reviews || [];
    const avgRating = parseFloat(stats.average_rating || 0).toFixed(1);

    const renderStars = (rating, size = 16) => {
        return [1, 2, 3, 4, 5].map(i => (
            <Ionicons
                key={i}
                name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
                size={moderateScale(size)}
                color={i <= rating ? GOLD : '#d1d5db'}
            />
        ));
    };

    const maxDistCount = Math.max(...Object.values(stats.distribution || {}), 1);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={TEAL} />
                    <Text style={styles.loadingText}>Loading ratings...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(8) }]}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(26)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Ratings</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} colors={[TEAL]} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewLeft}>
                        <Text style={styles.avgRatingNum}>{avgRating}</Text>
                        <View style={styles.starsRow}>{renderStars(parseFloat(avgRating), 20)}</View>
                        <Text style={styles.reviewCount}>{stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}</Text>
                    </View>

                    <View style={styles.overviewRight}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.distribution?.[star] || 0;
                            const pct = maxDistCount > 0 ? (count / maxDistCount) * 100 : 0;
                            return (
                                <View key={star} style={styles.distRow}>
                                    <Text style={styles.distStar}>{star}</Text>
                                    <Ionicons name="star" size={moderateScale(10)} color={GOLD} />
                                    <View style={styles.distTrack}>
                                        <View style={[styles.distBar, { width: `${pct}%` }]} />
                                    </View>
                                    <Text style={styles.distCount}>{count}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Reviews */}
                <Text style={styles.sectionTitle}>Customer Reviews</Text>

                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>
                                        {review.is_anonymous ? '?' : (review.customer_name?.[0] || '?')}
                                    </Text>
                                </View>
                                <View style={styles.reviewMeta}>
                                    <Text style={styles.reviewerName}>
                                        {review.is_anonymous ? 'Anonymous' : review.customer_name}
                                    </Text>
                                    <Text style={styles.reviewService}>{review.service}</Text>
                                </View>
                                <View style={styles.reviewDateCol}>
                                    <View style={styles.starsRowSmall}>{renderStars(review.rating, 12)}</View>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>
                            </View>
                            {review.review ? (
                                <Text style={styles.reviewText}>"{review.review}"</Text>
                            ) : null}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyBox}>
                        <Ionicons name="star-outline" size={moderateScale(50)} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No reviews yet</Text>
                        <Text style={styles.emptySubText}>Complete jobs to receive reviews from customers</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(10), color: '#64748b', fontSize: moderateScale(14) },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(18),
    },
    menuBtn: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },

    scrollContent: { padding: scale(16), paddingBottom: verticalScale(60) },

    overviewCard: {
        backgroundColor: '#fff', borderRadius: moderateScale(20), padding: moderateScale(20),
        flexDirection: 'row', gap: scale(16), marginBottom: verticalScale(20),
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
    },
    overviewLeft: { alignItems: 'center', justifyContent: 'center', minWidth: scale(90) },
    avgRatingNum: { fontSize: moderateScale(44), fontWeight: '900', color: '#0f172a' },
    starsRow: { flexDirection: 'row', gap: 2, marginVertical: verticalScale(6) },
    starsRowSmall: { flexDirection: 'row', gap: 1 },
    reviewCount: { fontSize: moderateScale(12), color: '#94a3b8', fontWeight: '600' },

    overviewRight: { flex: 1, justifyContent: 'center', gap: verticalScale(6) },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    distStar: { fontSize: moderateScale(12), color: '#475569', fontWeight: '700', width: 14, textAlign: 'right' },
    distTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    distBar: { height: '100%', backgroundColor: GOLD, borderRadius: 4 },
    distCount: { fontSize: moderateScale(11), color: '#94a3b8', width: 20, textAlign: 'right' },

    sectionTitle: { fontSize: moderateScale(15), fontWeight: '700', color: '#0f172a', marginBottom: verticalScale(12) },

    reviewCard: {
        backgroundColor: '#fff', borderRadius: moderateScale(18), padding: moderateScale(16),
        marginBottom: verticalScale(12),
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: scale(10), marginBottom: verticalScale(10) },
    avatarCircle: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
        backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: moderateScale(16), fontWeight: '800', color: TEAL },
    reviewMeta: { flex: 1 },
    reviewerName: { fontSize: moderateScale(14), fontWeight: '700', color: '#0f172a' },
    reviewService: { fontSize: moderateScale(12), color: '#64748b', marginTop: 2 },
    reviewDateCol: { alignItems: 'flex-end', gap: 4 },
    reviewDate: { fontSize: moderateScale(11), color: '#94a3b8' },
    reviewText: { fontSize: moderateScale(13), color: '#475569', lineHeight: moderateScale(20), fontStyle: 'italic' },

    emptyBox: { backgroundColor: '#fff', borderRadius: moderateScale(18), padding: moderateScale(40), alignItems: 'center' },
    emptyText: { fontSize: moderateScale(17), fontWeight: '700', color: '#334155', marginTop: verticalScale(14) },
    emptySubText: { fontSize: moderateScale(13), color: '#94a3b8', marginTop: 8, textAlign: 'center', lineHeight: moderateScale(18) },
});

export default RatingsScreen;
