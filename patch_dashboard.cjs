const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/CustomerDashboard.js', 'utf8');

// 1. Imports
code = code.replace(
    /Image,\n} from 'react-native';/,
    `Image,\n    Modal,\n    TextInput,\n    Alert,\n} from 'react-native';\nimport AsyncStorage from '@react-native-async-storage/async-storage';`
);

// 2. State
code = code.replace(
    /const \[featuredServices, setFeaturedServices\] = useState\(\[\]\);/,
    `const [featuredServices, setFeaturedServices] = useState([]);\n    const [ratingVisible, setRatingVisible] = useState(false);\n    const [ratingBooking, setRatingBooking] = useState(null);\n    const [ratingValue, setRatingValue] = useState(5);\n    const [ratingComment, setRatingComment] = useState('');\n    const [isSubmittingRating, setIsSubmittingRating] = useState(false);`
);

// 3. fetchCustomerData logic
code = code.replace(
    /setFeaturedServices\(featuredRes\.data \|\| \[\]\);/,
    `setFeaturedServices(featuredRes.data || []);\n\n            const bookingsData = bookingsRes.data || [];\n            if (user?.id) {\n                const unratedBooking = bookingsData.find(b => b.can_review);\n                if (unratedBooking) {\n                    const promptKey = \`@rating_prompt_\${unratedBooking.id}\`;\n                    const countStr = await AsyncStorage.getItem(promptKey);\n                    const count = countStr ? parseInt(countStr) : 0;\n                    if (count < 2) {\n                        setRatingBooking(unratedBooking);\n                        setRatingValue(5);\n                        setRatingComment('');\n                        setRatingVisible(true);\n                        await AsyncStorage.setItem(promptKey, (count + 1).toString());\n                    }\n                }\n            }`
);

// 4. Rating Submit logic & Modal UI
const modalUI = `
    const submitRating = async () => {
        if (!ratingBooking) return;
        setIsSubmittingRating(true);
        try {
            await api.post('/api/customer/reviews', {
                booking_id: ratingBooking.id,
                provider_id: ratingBooking.provider_id,
                customer_id: user.id,
                rating: ratingValue,
                review: ratingComment,
                is_anonymous: false
            });
            Alert.alert('Success', 'Thank you for your review!');
            setRatingVisible(false);
            fetchCustomerData();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const renderRatingModal = () => (
        <Modal
            visible={ratingVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setRatingVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setRatingVisible(false)}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Rate Your Service</Text>
                    <Text style={styles.modalSub}>How was the service for {ratingBooking?.service_name}?</Text>
                    
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TouchableOpacity key={i} onPress={() => setRatingValue(i)}>
                                <Ionicons name={i <= ratingValue ? "star" : "star-outline"} size={40} color="#f59e0b" style={{ marginHorizontal: 5 }} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Leave a comment (optional)..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={4}
                        value={ratingComment}
                        onChangeText={setRatingComment}
                    />

                    <TouchableOpacity 
                        style={[styles.submitReviewBtn, isSubmittingRating && { opacity: 0.7 }]}
                        onPress={submitRating}
                        disabled={isSubmittingRating}
                    >
                        {isSubmittingRating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitReviewTxt}>Submit Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (loading && !refreshing) {`;

code = code.replace(/if \(loading && !refreshing\) {/, modalUI);

// 5. Render Modal
code = code.replace(/\{(\/\* Bottom padding for tab bar visibility \*\/)\}/, `{renderRatingModal()}\n\n                {/* Bottom padding for tab bar visibility */}`);

// 6. Styles
const modalStyles = `
    emptyBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: Typography.bodyLarge },

    /* Rating Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: moderateScale(20) },
    modalContainer: { width: '100%', backgroundColor: '#fff', borderRadius: moderateScale(24), padding: moderateScale(24), alignItems: 'center', elevation: 10 },
    modalCloseIcon: { position: 'absolute', top: moderateScale(15), right: moderateScale(15), padding: moderateScale(5) },
    modalTitle: { fontSize: Typography.h4, fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(5), marginTop: verticalScale(10) },
    modalSub: { fontSize: Typography.body, color: '#64748b', textAlign: 'center', marginBottom: verticalScale(20) },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: verticalScale(25) },
    reviewInput: { width: '100%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(12), padding: moderateScale(15), fontSize: Typography.body, color: '#1e293b', minHeight: verticalScale(100), textAlignVertical: 'top', marginBottom: verticalScale(20) },
    submitReviewBtn: { width: '100%', backgroundColor: PRIMARY, paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center' },
    submitReviewTxt: { color: '#fff', fontSize: Typography.bodyLarge, fontWeight: 'bold' },
});`;

code = code.replace(/emptyBtnTxt: \{ color: '#fff', fontWeight: 'bold', fontSize: Typography.bodyLarge \},\n\}\);/, modalStyles);

fs.writeFileSync('mobile/src/screens/CustomerDashboard.js', code);
console.log('CustomerDashboard.js updated successfully!');
