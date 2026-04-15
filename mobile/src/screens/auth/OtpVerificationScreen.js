import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import { api } from '../../utils/api';

const OtpVerificationScreen = ({ navigation, route }) => {
    const { email, type } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);
    const [statusModal, setStatusModal] = useState({ visible: false, message: '', type: 'success' });
    const modalFade = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.8)).current;

    const showStatus = (msg, type = 'success') => {
        setStatusModal({ visible: true, message: msg, type });
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

    const hideStatus = () => {
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
        ]).start(() => setStatusModal(prev => ({ ...prev, visible: false })));
    };

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            showStatus('Please enter the 6-digit verification code.', 'error');
            return;
        }

        setLoading(true);
        try {
            const endpoint = type === 'pro'
                ? '/api/provider/verify-otp'
                : '/api/auth/verify-otp';

            const res = await api.post(endpoint, { email, otp: otpString });

            if (res.success) {
                navigation.navigate('ResetPassword', { email, otp: otpString, type });
            } else {
                showStatus(res.message || 'Invalid verification code.', 'error');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            showStatus('Something went wrong. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setLoading(true);
        try {
            // Use unified mobile endpoint for resending as well
            const endpoint = '/api/auth/mobile/forgot-password';

            const res = await api.post(endpoint, { email, source: 'mobile' });

            if (res.success) {
                setTimer(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
                showStatus('Verification code resent to your email.', 'success');
            } else {
                showStatus(res.message || 'Failed to resend code.', 'error');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            showStatus('Something went wrong. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusModal = () => (
        <Modal
            transparent
            visible={statusModal.visible}
            animationType="none"
            onRequestClose={hideStatus}
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
                    <View style={styles.iconContainer}>
                        <View style={[
                            styles.iconCircle,
                            statusModal.type === 'success' ? styles.successCircle : styles.errorCircle
                        ]}>
                            {statusModal.type === 'success' ? (
                                <View style={styles.checkmarkWrapper}>
                                    <View style={styles.checkmarkStem} />
                                    <View style={styles.checkmarkKick} />
                                </View>
                            ) : (
                                <Text style={styles.errorExclamation}>!</Text>
                            )}
                        </View>
                    </View>
                    <Text style={styles.modalTitle}>
                        {statusModal.type === 'success' ? 'Great!' : 'Oops!'}
                    </Text>
                    <Text style={styles.modalMessage}>{statusModal.message}</Text>
                    <TouchableOpacity
                        style={[
                            styles.modalButton,
                            statusModal.type === 'success' ? styles.successButton : styles.errorButton
                        ]}
                        onPress={hideStatus}
                    >
                        <Text style={styles.modalButtonText}>
                            {statusModal.type === 'success' ? 'Continue' : 'Try Again'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderStatusModal()}
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
                        {SCREEN_HEIGHT > 750 && (
                            <Image
                                source={require('../../../assets/otp_verify.png')}
                                style={styles.miniIllustration}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.title}>Verification</Text>
                        <Text style={styles.subtitle}>
                            Please enter the 6-digit code sent to {'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </View>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (loading || otp.join('').length < 6) && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={loading || otp.join('').length < 6}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        <TouchableOpacity onPress={handleResend} disabled={timer > 0 || loading}>
                            <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: verticalScale(20),
        marginTop: verticalScale(15),
    },
    backIcon: {
        fontSize: moderateScale(20),
        color: '#0f172a',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(30),
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
        marginTop: verticalScale(10),
        lineHeight: moderateScale(22),
    },
    emailText: {
        color: '#0f172a',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(40),
    },
    otpInput: {
        width: moderateScale(45),
        height: moderateScale(55),
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        textAlign: 'center',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#115e59',
        backgroundColor: '#f8fafc',
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
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: verticalScale(30),
    },
    resendText: {
        fontSize: moderateScale(15),
        color: '#64748b',
    },
    resendLink: {
        fontSize: moderateScale(15),
        color: '#115e59',
        fontWeight: 'bold',
    },
    resendDisabled: {
        color: '#94a3b8',
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
    iconContainer: {
        marginBottom: verticalScale(20),
    },
    iconCircle: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    successCircle: {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
    },
    errorCircle: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    checkmarkWrapper: {
        width: moderateScale(30),
        height: moderateScale(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkStem: {
        position: 'absolute',
        width: moderateScale(4),
        height: moderateScale(20),
        backgroundColor: '#22c55e',
        borderRadius: 2,
        transform: [{ rotate: '45deg' }, { translateX: moderateScale(4) }, { translateY: moderateScale(-1) }],
    },
    checkmarkKick: {
        position: 'absolute',
        width: moderateScale(4),
        height: moderateScale(10),
        backgroundColor: '#22c55e',
        borderRadius: 2,
        transform: [{ rotate: '-45deg' }, { translateX: moderateScale(-5) }, { translateY: moderateScale(4) }],
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
        paddingVertical: verticalScale(14),
        paddingHorizontal: scale(40),
        borderRadius: moderateScale(12),
        width: '100%',
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#115e59',
    },
    errorButton: {
        backgroundColor: '#ef4444',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    }
});

export default OtpVerificationScreen;
