import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config';

const PRIMARY = '#115e59';

const CreateBookingScreen = ({ navigation, route }) => {
    const { service } = route.params;
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [fetchingIntent, setFetchingIntent] = useState(false);
    const [intentError, setIntentError] = useState(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Form State (Intelligent name parsing for Google users)
    const initialFirstName = user?.first_name || (user?.name ? user.name.split(' ')[0] : '');
    const initialLastName = user?.last_name || (user?.name ? user.name.split(' ').slice(1).join(' ') : '');

    const [bookingData, setBookingData] = useState({
        service_id: service.id,
        service_name: service.name,
        service_price: service.base_price || service.price || 0,
        additional_price: service.additional_price || 0,
        job_date: new Date().toISOString().split('T')[0],
        job_time_slot: '',
        address_line1: user?.address || '',
        address_line2: '',
        job_description: '',
        timing_constraints: '',
        parking_access: false,
        elevator_access: false,
        has_pets: false,
        first_name: initialFirstName,
        last_name: initialLastName,
        name: user?.name || `${initialFirstName} ${initialLastName}`.trim(),
        email: user?.email || '',
        phone: user?.phone || '',
        photos: [],
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];

    const pickImage = async () => {
        if (bookingData.photos.length >= 5) {
            Alert.alert('Limit Reached', 'You can upload up to 5 photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 1000 } }], // Resize to 1000px width while maintaining aspect ratio
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
            );
            uploadPhoto(manipResult.uri);
        }
    };

    const uploadPhoto = async (uri) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('file', { uri, name: filename, type });

            const res = await apiService.post('/api/upload', formData);

            if (res.success) {
                const fullUrl = res.url.startsWith('http') ? res.url : `${API_BASE_URL}${res.url}`;
                setBookingData(prev => ({
                    ...prev,
                    photos: [...prev.photos, fullUrl]
                }));
            } else {
                Alert.alert('Upload Failed', res.message || 'Could not upload image.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload photo.');
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (url) => {
        setBookingData(prev => ({
            ...prev,
            photos: prev.photos.filter(p => p !== url)
        }));
    };

    const nextStep = async () => {
        if (step === 1 && !bookingData.address_line1) {
            Alert.alert('Fields Required', 'Service Address is required.');
            return;
        }
        if (step === 2 && (!bookingData.job_date || !bookingData.job_time_slot)) {
            Alert.alert('Selection Required', 'Please select a date and time slot.');
            return;
        }
        if (step === 3) {
            if (!bookingData.phone || !bookingData.job_description || !bookingData.timing_constraints) {
                Alert.alert('Fields Required', 'Phone, Job Description, and Timing Constraints are required.');
                return;
            }
            if (bookingData.job_description.trim().length < 50) {
                Alert.alert('Details Needed', 'Please provide a more detailed job description (at least 50 characters).');
                return;
            }
        }

        if (step === 4) {
            setFetchingIntent(true);
            try {
                const res = await apiService.post('/api/payment/create-intent', {
                    service_id: service.id,
                    service_price: service.base_price || service.price || 0,
                    additional_price: service.additional_price || 0,
                    service_name: service.name,
                });

                if (res.success && res.client_secret) {
                    setClientSecret(res.client_secret);
                    const totalAuthorizedAmount = parseFloat(service.base_price || service.price || 0) + (parseFloat(service.additional_price || 0) * 2);
                    // Construct the URL to load the Next.js hosted payment page
                    const url = `${API_BASE_URL}/mobile-payment?clientSecret=${res.client_secret}&amount=${totalAuthorizedAmount}`;
                    setPaymentUrl(url);
                    setStep(step + 1);
                } else {
                    Alert.alert('Error', 'Could not initialize payment. Please try again.');
                }
            } catch (error) {
                console.error('Payment intent error:', error);
                Alert.alert('Error', 'Failed to initialize secure payment.');
            } finally {
                setFetchingIntent(false);
            }
        } else {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    const handleConfirm = async (paymentIntentId) => {
        setLoading(true);
        try {
            const payload = {
                ...bookingData,
                user_id: user.id,
                payment_intent_id: paymentIntentId,
            };

            const res = await apiService.post('/api/bookings', payload);
            if (res.success) {
                navigation.navigate('BookingSuccess', {
                    bookingNumber: res.booking_number,
                    bookingId: res.booking_id
                });
            } else {
                Alert.alert('Error', res.message || 'Failed to create booking.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success' && data.paymentIntentId) {
                handleConfirm(data.paymentIntentId);
            }
        } catch (e) {
            console.error('Error parsing webview message', e);
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(Platform.OS === 'ios');
        setBookingData({
            ...bookingData,
            job_date: currentDate.toISOString().split('T')[0]
        });
    };

    const openViewer = (url) => {
        setSelectedImage(url);
        setViewerVisible(true);
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

    const renderStep1 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Where do you need service?</Text>

            <Text style={styles.label}>Service Address *</Text>
            <TextInput
                style={styles.input}
                value={bookingData.address_line1}
                onChangeText={txt => setBookingData({ ...bookingData, address_line1: txt })}
                placeholder="Full address (Street, City, Province, Postal)"
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>When should we come?</Text>

            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
            >
                <Ionicons name="calendar-outline" size={20} color={PRIMARY} />
                <Text style={styles.dateText}>{bookingData.job_date}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date(bookingData.job_date)}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}

            <Text style={styles.label}>Select Time Slot</Text>
            <View style={styles.slotsGrid}>
                {timeSlots.map(slot => (
                    <TouchableOpacity
                        key={slot}
                        style={[
                            styles.slotBtn,
                            bookingData.job_time_slot === slot && styles.slotBtnActive
                        ]}
                        onPress={() => setBookingData({ ...bookingData, job_time_slot: slot })}
                    >
                        <Text style={[
                            styles.slotText,
                            bookingData.job_time_slot === slot && styles.slotTextActive
                        ]}>{slot}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Job Details</Text>

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
                style={styles.input}
                value={bookingData.phone}
                onChangeText={txt => setBookingData({ ...bookingData, phone: txt })}
                placeholder="+1 (403) 000-0000"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Job Description *</Text>
            <Text style={styles.labelHelper}>Please describe the job in detail (at least 50 characters).</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={bookingData.job_description}
                onChangeText={txt => setBookingData({ ...bookingData, job_description: txt })}
                placeholder="What needs to be done? (e.g. Issue, make/model)"
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Job Photos (Optional)</Text>
            <Text style={styles.labelHelper}>You can upload up to 5 photos to help the professional understand the job.</Text>
            <View style={styles.photoList}>
                {bookingData.photos.map((url, index) => (
                    <View key={index} style={styles.photoWrapper}>
                        <TouchableOpacity onPress={() => openViewer(url)}>
                            <Image source={{ uri: url }} style={styles.photo} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(url)}>
                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))}
                {bookingData.photos.length < 5 && (
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage} disabled={uploading}>
                        {uploading ? <ActivityIndicator color={PRIMARY} /> : <Ionicons name="camera-outline" size={30} color={PRIMARY} />}
                        <Text style={styles.addPhotoText}>{uploading ? 'Uploading...' : 'Add Photo'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.label}>Timing Constraints *</Text>
            <TextInput
                style={styles.input}
                value={bookingData.timing_constraints}
                onChangeText={txt => setBookingData({ ...bookingData, timing_constraints: txt })}
                placeholder="e.g. Must be done before 2 PM"
            />


            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Street Parking Available?</Text>
                <Switch
                    value={bookingData.parking_access}
                    onValueChange={val => setBookingData({ ...bookingData, parking_access: val })}
                    trackColor={{ true: PRIMARY }}
                />
            </View>

            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Building has Elevator?</Text>
                <Switch
                    value={bookingData.elevator_access}
                    onValueChange={val => setBookingData({ ...bookingData, elevator_access: val })}
                    trackColor={{ true: PRIMARY }}
                />
            </View>

            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Pets in House?</Text>
                <Switch
                    value={bookingData.has_pets}
                    onValueChange={val => setBookingData({ ...bookingData, has_pets: val })}
                    trackColor={{ true: PRIMARY }}
                />
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderStep4 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Review Your Booking</Text>

            <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                    <Text style={styles.reviewTitle}>{service.name}</Text>
                    <Text style={styles.reviewPrice}>${parseFloat(service.base_price || service.price || 0).toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>SCHEDULE</Text>
                    <View style={styles.reviewRow}>
                        <Ionicons name="calendar-outline" size={16} color="#64748b" />
                        <Text style={styles.reviewText}>{bookingData.job_date}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={styles.reviewText}>{bookingData.job_time_slot}</Text>
                    </View>
                </View>

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>LOCATION</Text>
                    <View style={styles.reviewRow}>
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={styles.reviewText}>{bookingData.address_line1}</Text>
                    </View>
                </View>

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>CONTACT</Text>
                    <Text style={styles.reviewText}>{bookingData.first_name} {bookingData.last_name}</Text>
                    <Text style={styles.reviewText}>{bookingData.phone}</Text>
                    <Text style={styles.reviewText}>{bookingData.email}</Text>
                </View>

                {bookingData.job_description ? (
                    <View style={styles.reviewSection}>
                        <Text style={styles.reviewLabel}>DESCRIPTION</Text>
                        <Text style={styles.reviewText}>{bookingData.job_description}</Text>
                    </View>
                ) : null}

                {bookingData.timing_constraints ? (
                    <View style={styles.reviewSection}>
                        <Text style={styles.reviewLabel}>EXTRA DETAILS</Text>
                        <View style={styles.reviewRow}>
                            <Ionicons name="hourglass-outline" size={14} color="#64748b" />
                            <Text style={styles.reviewText}>Limits: {bookingData.timing_constraints}</Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>ACCESS & AMENITIES</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, bookingData.parking_access && styles.badgeActive]}>
                            <Ionicons name="car-outline" size={12} color={bookingData.parking_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, bookingData.parking_access && styles.badgeTextActive]}>Parking</Text>
                        </View>
                        <View style={[styles.badge, bookingData.elevator_access && styles.badgeActive]}>
                            <Ionicons name="business-outline" size={12} color={bookingData.elevator_access ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, bookingData.elevator_access && styles.badgeTextActive]}>Elevator</Text>
                        </View>
                        <View style={[styles.badge, bookingData.has_pets && styles.badgeActive]}>
                            <Ionicons name="paw-outline" size={12} color={bookingData.has_pets ? '#fff' : '#64748b'} />
                            <Text style={[styles.badgeText, bookingData.has_pets && styles.badgeTextActive]}>Pets</Text>
                        </View>
                    </View>
                </View>

                {bookingData.photos.length > 0 && (
                    <View style={styles.reviewSection}>
                        <Text style={styles.reviewLabel}>PHOTOS</Text>
                        <View style={styles.photoListMini}>
                            {bookingData.photos.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => openViewer(url)}>
                                    <Image source={{ uri: url }} style={styles.photoMini} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderStep5 = () => (
        <View style={styles.stepContainer}>
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>Payment & Authorization</Text>

                <View style={[styles.paymentCard, { padding: 15, marginBottom: 10 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a' }}>Total Amount</Text>
                        <Text style={{ fontWeight: '800', fontSize: 20, color: PRIMARY }}>
                            ${(parseFloat(service.base_price || service.price || 0) + (parseFloat(service.additional_price || 0) * 2)).toFixed(2)}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        Includes base price + 2hr overtime authorization hold.
                    </Text>
                </View>

                <View style={[styles.infobox, { padding: 12 }]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#0f766e" />
                    <Text style={[styles.infoboxText, { fontSize: 11 }]}>
                        Securely processed via Stripe. Card details are never stored.
                    </Text>
                </View>
            </View>

            {paymentUrl ? (
                <View style={styles.webviewContainer}>
                    <WebView
                        source={{ uri: paymentUrl }}
                        onMessage={handleWebViewMessage}
                        showsVerticalScrollIndicator={true}
                        bounces={false}
                        scrollEnabled={true}
                        style={{ backgroundColor: 'transparent' }}
                        nestedScrollEnabled={true}
                    />
                </View>
            ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text>Loading secure payment gateway...</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${(step / 5) * 100}%` }]} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.stepIndicator}>Step {step} of 5</Text>
                    <Text style={styles.stepTitle}>
                        {step === 1 ? 'Location' : step === 2 ? 'Schedule' : step === 3 ? 'Details' : step === 4 ? 'Confirm' : 'Payment'}
                    </Text>
                </View>
            </View>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {renderImageViewer()}

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, moderateScale(20)) }]}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                )}
                {step < 5 && (
                    <TouchableOpacity style={styles.nextBtn} onPress={nextStep} disabled={uploading || fetchingIntent}>
                        {fetchingIntent ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.nextBtnText}>{step === 4 ? 'Go to Payment' : 'Next Step'}</Text>
                        )}
                    </TouchableOpacity>
                )}
                {/* The Pay & Book Now button is removed from step 4 footer as the WebView handles submission */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: moderateScale(20), marginTop: verticalScale(25), borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
    progressTrack: { height: moderateScale(6), backgroundColor: '#f1f5f9', borderRadius: moderateScale(3), marginBottom: verticalScale(12) },
    progressBar: { height: '100%', backgroundColor: PRIMARY, borderRadius: moderateScale(3) },
    headerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stepIndicator: { fontSize: moderateScale(12), color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
    stepTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },

    stepContainer: { flex: 1, padding: moderateScale(20) },
    sectionTitle: { fontSize: moderateScale(22), fontWeight: '800', color: '#0f172a', marginBottom: verticalScale(20) },
    label: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(2), marginTop: verticalScale(15) },
    labelHelper: { fontSize: moderateScale(12), color: '#64748b', marginBottom: verticalScale(10) },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(18),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: verticalScale(10),
    },
    dateText: { marginLeft: scale(12), fontSize: moderateScale(16), fontWeight: '600', color: '#1e293b' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) },
    slotBtn: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minWidth: '45%',
    },
    slotBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    slotText: { color: '#64748b', fontSize: moderateScale(14), textAlign: 'center' },
    slotTextActive: { color: '#fff', fontWeight: 'bold' },

    input: {
        padding: moderateScale(15),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: moderateScale(16),
        color: '#1e293b',
    },
    textArea: { height: verticalScale(120), textAlignVertical: 'top' },
    row: { flexDirection: 'row', marginTop: verticalScale(5) },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: verticalScale(20), paddingVertical: verticalScale(5) },
    switchLabel: { fontSize: moderateScale(16), color: '#1e293b', fontWeight: '500' },

    photoList: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10), marginTop: verticalScale(10) },
    photoWrapper: { position: 'relative' },
    photo: { width: scale(80), height: scale(80), borderRadius: moderateScale(12) },
    removePhotoBtn: { position: 'absolute', top: -verticalScale(5), right: -scale(5), backgroundColor: '#fff', borderRadius: moderateScale(10) },
    addPhotoBtn: {
        width: scale(80),
        height: scale(80),
        borderRadius: moderateScale(12),
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    addPhotoText: { fontSize: moderateScale(10), color: PRIMARY, fontWeight: 'bold', marginTop: verticalScale(5) },

    reviewCard: {
        padding: moderateScale(20),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(24),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    reviewTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a', flex: 1 },
    reviewPrice: { fontSize: moderateScale(20), fontWeight: 'bold', color: PRIMARY },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: verticalScale(20) },
    reviewSection: { marginBottom: verticalScale(15) },
    reviewLabel: { fontSize: moderateScale(10), fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: verticalScale(5) },
    reviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(5) },
    reviewText: { marginLeft: scale(8), fontSize: moderateScale(15), color: '#334155', fontWeight: '500' },

    photoListMini: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(6), marginTop: verticalScale(5) },
    photoMini: { width: scale(45), height: scale(45), borderRadius: moderateScale(8) },

    /* Payment Card */
    paymentCard: {
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: verticalScale(20),
    },
    paymentCardTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(15) },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(10) },
    paymentLabel: { fontSize: moderateScale(14), color: '#64748b' },
    paymentValue: { fontSize: moderateScale(14), fontWeight: '600', color: '#0f172a' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: verticalScale(15), marginTop: verticalScale(5) },
    totalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#0f172a' },
    totalPrice: { fontSize: moderateScale(20), fontWeight: 'bold', color: PRIMARY },
    paymentNote: { fontSize: moderateScale(12), color: '#94a3b8', marginTop: verticalScale(15), fontStyle: 'italic', lineHeight: moderateScale(18) },

    infobox: {
        flexDirection: 'row',
        backgroundColor: '#f0fdfa',
        padding: moderateScale(18),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccfbf1',
    },
    infoboxText: { flex: 1, marginLeft: scale(12), fontSize: moderateScale(13), color: '#0f766e', lineHeight: moderateScale(18), fontWeight: '500' },

    webviewContainer: {
        flex: 1,
        marginTop: verticalScale(10),
        backgroundColor: 'transparent'
    },

    footer: {
        flexDirection: 'row',
        padding: moderateScale(20),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: scale(12),
        backgroundColor: '#fff',
    },
    backBtn: { flex: 1, paddingVertical: verticalScale(16), alignItems: 'center', borderRadius: moderateScale(14), backgroundColor: '#f1f5f9' },
    backBtnText: { fontWeight: 'bold', color: '#475569', fontSize: moderateScale(16) },
    nextBtn: { flex: 2, paddingVertical: verticalScale(16), alignItems: 'center', borderRadius: moderateScale(14), backgroundColor: PRIMARY },
    nextBtnText: { fontWeight: 'bold', color: '#fff', fontSize: moderateScale(16) },
    confirmBtn: { flex: 2, paddingVertical: verticalScale(16), alignItems: 'center', borderRadius: moderateScale(14), backgroundColor: PRIMARY },
    confirmBtnText: { fontWeight: 'bold', color: '#fff', fontSize: moderateScale(16) },
    disabledBtn: { opacity: 0.6 },

    /* Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    viewerImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },

    /* Badge Styles */
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    badgeActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    badgeText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    badgeTextActive: {
        color: '#fff',
    },
});

export default CreateBookingScreen;
