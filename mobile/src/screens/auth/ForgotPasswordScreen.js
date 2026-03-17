import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Modal,
    Animated
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import { api } from '../../utils/api';
import { Alert } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
    const route = useRoute();
    const { type } = route.params || {};
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const modalFade = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.8)).current;

    const showError = (msg) => {
        setError(msg);
        Animated.parallel([
            Animated.timing(modalFade, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(modalScale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const hideError = () => {
        Animated.parallel([
            Animated.timing(modalFade, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(modalScale, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => setError(null));
    };

    const handleReset = async () => {
        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            // Use unified mobile endpoint which handles both roles
            const endpoint = '/api/auth/mobile/forgot-password';

            const res = await api.post(endpoint, { email, source: 'mobile' });

            if (res.success) {
                setIsSubmitted(true);
                // Use the type returned by the server if available, fallback to existing type
                const userType = res.type || type;
                navigation.navigate('OtpVerification', { email, type: userType });
            } else {
                showError(res.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            showError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const isSmallDevice = SCREEN_HEIGHT < 750;
    const isVerySmallDevice = SCREEN_HEIGHT < 650;

    const renderErrorModal = () => (
        <Modal
            transparent
            visible={!!error}
            animationType="none"
            onRequestClose={hideError}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            opacity: modalFade,
                            transform: [{ scale: modalScale }]
                        }
                    ]}
                >
                    <View style={styles.errorIconContainer}>
                        <View style={styles.errorCircle}>
                            <Text style={styles.errorExclamation}>!</Text>
                        </View>
                    </View>
                    <Text style={styles.modalTitle}>Uh oh!</Text>
                    <Text style={styles.modalMessage}>{error}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={hideError}>
                        <Text style={styles.modalButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderErrorModal()}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        {!isVerySmallDevice && (
                            <Image
                                source={require('../../../assets/forgot_worker.png')}
                                style={[
                                    styles.miniIllustration,
                                    isSmallDevice && { width: moderateScale(80), height: moderateScale(80) }
                                ]}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            {isSubmitted
                                ? "Check your email for reset instructions."
                                : `Enter your ${type === 'pro' ? 'Pro' : 'Customer'} email to reset your password.`}
                        </Text>
                    </View>

                    {!isSubmitted ? (
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="test@yopmail.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleReset}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Send Verification Code</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.successSection}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('Login', { type })}
                            >
                                <Text style={styles.secondaryButtonText}>Return to Login</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.footer}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.footerText}>
                            Back to <Text style={styles.footerLink}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(10),
        flexGrow: 1,
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    backIcon: {
        fontSize: moderateScale(20),
        color: '#0f172a',
        fontWeight: 'bold',
        
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    miniIllustration: {
        width: moderateScale(120),
        height: moderateScale(120),
        marginBottom: verticalScale(10),
    },
    title: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: moderateScale(15),
        color: '#64748b',
        textAlign: 'center',
        marginTop: verticalScale(4),
        lineHeight: moderateScale(22),
        paddingHorizontal: scale(20),
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: verticalScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#475569',
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        fontSize: moderateScale(16),
        color: '#0f172a',
    },
    button: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#115e59',
    },
    secondaryButtonText: {
        color: '#115e59',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    footer: {
        marginTop: verticalScale(30),
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    footerText: {
        fontSize: moderateScale(15),
        color: '#64748b',
    },
    footerLink: {
        color: '#115e59',
        fontWeight: 'bold',
    },
    successSection: {
        marginTop: verticalScale(10),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(40),
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: moderateScale(30),
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    errorIconContainer: {
        marginBottom: verticalScale(20),
    },
    errorCircle: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ef4444',
    },
    errorExclamation: {
        fontSize: moderateScale(36),
        fontWeight: 'bold',
        color: '#ef4444',
    },
    modalTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(10),
    },
    modalMessage: {
        fontSize: moderateScale(16),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: moderateScale(24),
        marginBottom: verticalScale(24),
    },
    modalButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(14),
        paddingHorizontal: scale(40),
        borderRadius: moderateScale(12),
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    }
});

export default ForgotPasswordScreen;
