import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { api } from '../../utils/api';

const ReviewsScreen = ({ navigation }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/api/reviews');
            if (res.success) {
                setReviews(res.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeleteReview = (id) => {
        Alert.alert(
            "Delete Review",
            "Are you sure you want to delete this review?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await api.delete(`/api/reviews?id=${id}`);
                            if (res.success) {
                                Alert.alert("Success", "Review deleted successfully");
                                fetchReviews();
                            } else {
                                Alert.alert("Error", res.message || "Failed to delete review");
                            }
                        } catch (error) {
                            console.error('Error deleting review:', error);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews();
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={moderateScale(14)}
                    color="#f59e0b"
                />
            );
        }
        return stars;
    };

    const renderReviewItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.reviewerAvatar}>
                    <Text style={styles.avatarText}>{item.customer_name?.[0] || 'U'}</Text>
                </View>
                <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>
                        {item.is_anonymous ? 'Anonymous' : item.customer_name}
                    </Text>
                    <View style={styles.starRow}>
                        {renderStars(item.rating)}
                        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteReview(item.id)}
                >
                    <Ionicons name="trash-outline" size={moderateScale(18)} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.serviceText}>Service: {item.service_name}</Text>
                <Text style={styles.commentText}>"{item.review || 'No comment provided'}"</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.providerText}>Pro: {item.provider_name}</Text>
                <View style={styles.bookingBadge}>
                    <Text style={styles.bookingText}>#{item.booking_number || item.booking_id}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reviews</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#115e59" />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={scale(60)} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No reviews found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        marginBottom: verticalScale(25),
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: scale(20) },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    reviewerAvatar: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#64748b' },
    reviewerInfo: { flex: 1, marginLeft: scale(12) },
    reviewerName: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#0f172a' },
    starRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(2) },
    dateText: { fontSize: moderateScale(11), color: '#94a3b8', marginLeft: scale(8) },
    deleteBtn: { padding: scale(5) },
    cardBody: {
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f8fafc',
        marginBottom: verticalScale(10),
    },
    serviceText: { fontSize: moderateScale(12), fontWeight: '700', color: '#115e59', marginBottom: verticalScale(4) },
    commentText: { fontSize: moderateScale(14), color: '#444', fontStyle: 'italic', lineHeight: verticalScale(20) },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    providerText: { fontSize: moderateScale(12), color: '#64748b', fontWeight: '600' },
    bookingBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6) },
    bookingText: { fontSize: moderateScale(10), fontWeight: 'bold', color: '#64748b' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(100) },
    emptyText: { fontSize: moderateScale(16), color: '#94a3b8', marginTop: verticalScale(20) },
});

export default ReviewsScreen;
