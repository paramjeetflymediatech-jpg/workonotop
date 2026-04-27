import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { Alert } from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import { ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../../context/AuthContext';

const ProviderSignupScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const { loginWithGoogle, loginWithApple } = useAuth();

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            const result = await loginWithGoogle('provider', 'signup');
            if (result.success) {
                console.log('🚀 [GoogleSignup] Success! RootNavigator will handle redirection to onboarding.');
            } else {
                setError(result.message);
                setShowError(true);
            }
        } catch (err) {
            setError('Google Signup failed');
            setShowError(true);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleSignup = async () => {
        setAppleLoading(true);
        try {
            const result = await loginWithApple('provider');
            if (result.success) {
                console.log('🚀 [AppleSignup] Success! RootNavigator will handle redirection to onboarding.');
            } else {
                setError(result.message);
                setShowError(true);
            }
        } catch (err) {
            setError('Apple Signup failed');
            setShowError(true);
        } finally {
            setAppleLoading(false);
        }
    };

    const handleSignup = async () => {
        const { firstName, lastName, email, phone, password, confirmPassword } = formData;

        // Basic presence check
        if (!firstName || !lastName || !email || !password) {
            setError('Please fill in all fields');
            setShowError(true);
            return;
        }

        // Name validation (min 2, max 15, letters only)
        const nameRegex = /^[A-Za-z\s]{2,15}$/;
        if (!nameRegex.test(firstName.trim())) {
            setError('First name must be 2-15 characters and contain only letters.');
            setShowError(true);
            return;
        }
        if (!nameRegex.test(lastName.trim())) {
            setError('Last name must be 2-15 characters and contain only letters.');
            setShowError(true);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase().trim())) {
            setError('Please enter a valid email address.');
            setShowError(true);
            return;
        }

        // Phone validation (10-15 digits) - only if provided
        if (phone.trim()) {
            const phoneRegex = /^\+?[\d\s-]{10,15}$/;
            if (!phoneRegex.test(phone.trim())) {
                setError('Phone number must be between 10 and 15 digits.');
                setShowError(true);
                return;
            }
        }

        // Password validation (min 8 chars, alphabets + special chars)
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters and contain both alphabets and special characters.');
            setShowError(true);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setShowError(true);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiService.post('/api/provider/signup', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim() || null,
                password,
                source: 'mobile'
            });

            if (response.success) {
                setShowSuccess(true);
            } else {
                setError(response.message || 'Signup failed');
                setShowError(true);
            }
        } catch (err) {
            setError(err.message || 'Connection failed. Please try again.');
            setShowError(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isSmallDevice = SCREEN_HEIGHT < 750;
    const isVerySmallDevice = SCREEN_HEIGHT < 650;

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" />
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
                                source={require('../../../assets/workers.png')}
                                style={[
                                    styles.miniIllustration,
                                    isSmallDevice && { height: verticalScale(40), width: verticalScale(40) }
                                ]}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.title}>Join as a Service Pro</Text>
                        {!isSmallDevice && (
                            <Text style={styles.subtitle}>Start earning with flexible, high-paying jobs near you</Text>
                        )}
                    </View>

                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: scale(10) }]}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="test@yopmail.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 (555) 000-0000"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: scale(10) }]}>
                                <PasswordInput
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="•••••••••"
                                    inputStyle={styles.passwordInputInner}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <PasswordInput
                                    label="Confirm"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    placeholder="••••••••"
                                    inputStyle={styles.passwordInputInner}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSignup}
                            disabled={loading || googleLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, googleLoading && styles.disabledButton]}
                            onPress={handleGoogleSignup}
                            disabled={loading || googleLoading}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color="#0f172a" />
                            ) : (
                                <View style={styles.googleButtonContent}>
                                    <Image 
                                        source={require('../../../assets/google_logo.png')} 
                                        style={styles.googleLogo}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.googleButtonText}>Signup with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && (
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={moderateScale(15)}
                                style={styles.appleButton}
                                onPress={handleAppleSignup}
                            />
                        )}

                        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login', { type: 'pro' })}>
                            <Text style={styles.footerText}>
                                Already a Pro? <Text style={styles.footerLink}>Sign in</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal
                visible={showSuccess}
                title="Account Created"
                message="Please check your email to verify your account before logging in."
                onOk={() => {
                    setShowSuccess(false);
                    navigation.navigate('EmailVerification', {
                        email: formData.email.toLowerCase().trim(),
                        type: 'pro'
                    });
                }}
            />

            <ErrorModal
                visible={showError}
                title="Registration Error"
                message={error}
                onOk={() => setShowError(false)}
            />
        </View>
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
        marginTop: verticalScale(15),

    },
    backIcon: {
        fontSize: moderateScale(20),
        color: '#0f172a',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    miniIllustration: {
        width: moderateScale(60),
        height: moderateScale(60),
        marginBottom: verticalScale(10),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        textAlign: 'center',
        marginTop: verticalScale(4),
        lineHeight: moderateScale(20),
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    inputContainer: {
        marginBottom: verticalScale(12),
    },
    label: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#475569',
        marginBottom: verticalScale(6),
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
    },
    submitButton: {
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
    submitButtonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
        backgroundColor: '#94a3b8',
    },
    errorText: {
        color: '#ef4444',
        fontSize: moderateScale(14),
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    footer: {
        marginTop: verticalScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    footerText: {
        fontSize: moderateScale(14),
        color: '#64748b',
    },
    footerLink: {
        color: '#115e59',
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(20),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: scale(10),
        color: '#94a3b8',
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    },
    googleButton: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleLogo: {
        width: moderateScale(22),
        height: moderateScale(22),
        marginRight: scale(10),
    },
    googleButtonText: {
        color: '#0f172a',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        letterSpacing: 0.2,
    },
    appleButton: {
        width: '100%',
        height: verticalScale(50),
        marginTop: verticalScale(14),
    }
});

export default ProviderSignupScreen;