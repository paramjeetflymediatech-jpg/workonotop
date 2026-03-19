import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import { api } from '../../utils/api';
import PasswordInput from '../../components/PasswordInput';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email, otp, type } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const minLength = type === 'pro' ? 6 : 8;
        if (password.length < minLength) {
            Alert.alert('Error', `Password must be at least ${minLength} characters.`);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = type === 'pro'
                ? '/api/provider/reset-password'
                : '/api/auth/reset-password';

            const payload = type === 'pro'
                ? { email, otp, password }
                : { email, otp, newPassword: password };

            const res = await api.post(endpoint, payload);

            if (res.success) {
                setIsSuccess(true);
            } else {
                Alert.alert('Error', res.message || 'Failed to reset password.');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSuccess = () => (
        <View style={styles.successWrapper}>
            <View style={styles.iconCircle}>
                <View style={styles.checkmarkStem} />
                <View style={styles.checkmarkKick} />
            </View>
            <Text style={styles.successTitle}>Security Updated!</Text>
            <Text style={styles.successSubtitle}>
                Your password has been changed successfully. You can now use your new credentials to sign in.
            </Text>
            <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate('Login', { type })}
            >
                <Text style={styles.signInButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    {!isSuccess && (
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                    )}

                    {!isSuccess ? (
                        <>
                            <View style={styles.header}>
                                {SCREEN_HEIGHT > 750 && (
                                    <Image
                                        source={require('../../../assets/reset_password.png')}
                                        style={styles.miniIllustration}
                                        resizeMode="contain"
                                    />
                                )}
                                <Text style={styles.title}>New Password</Text>
                                <Text style={styles.subtitle}>
                                    Please enter your new password below.
                                </Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <PasswordInput
                                        label="New Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="•••••••••"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <PasswordInput
                                        label="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="•••••••••"
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
                                        <Text style={styles.buttonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        renderSuccess()
                    )}
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
        marginTop: verticalScale(10),
    },
    form: {
        width: '100%',
        marginTop: verticalScale(10),
    },
    inputContainer: {
        marginBottom: verticalScale(20),
    },
    button: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginTop: verticalScale(10),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    successWrapper: {
        alignItems: 'center',
        paddingTop: verticalScale(60),
        paddingHorizontal: scale(10),
    },
    iconCircle: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: '#115e59', // Deep teal
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
        // Simple elevation/shadow
        shadowColor: "#115e59",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    checkmarkStem: {
        position: 'absolute',
        width: moderateScale(6),
        height: moderateScale(40),
        backgroundColor: '#fff',
        borderRadius: 3,
        transform: [{ rotate: '45deg' }, { translateX: moderateScale(8) }, { translateY: moderateScale(-2) }],
    },
    checkmarkKick: {
        position: 'absolute',
        width: moderateScale(6),
        height: moderateScale(20),
        backgroundColor: '#fff',
        borderRadius: 3,
        transform: [{ rotate: '-45deg' }, { translateX: moderateScale(-10) }, { translateY: moderateScale(8) }],
    },
    successTitle: {
        fontSize: moderateScale(30),
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: verticalScale(16),
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: moderateScale(16),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: moderateScale(26),
        marginBottom: verticalScale(50),
        paddingHorizontal: scale(20),
    },
    signInButton: {
        backgroundColor: '#115e59',
        width: '100%',
        paddingVertical: verticalScale(18),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: '700',
    },
});

export default ResetPasswordScreen;
