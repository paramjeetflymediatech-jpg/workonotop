import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRoute, CommonActions } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import Typography from '../../theme/Typography';

import PasswordInput from '../../components/PasswordInput';
import PremiumAlert from '../../components/PremiumAlert';
import * as AppleAuthentication from 'expo-apple-authentication';

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { type } = route.params || {};
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const { login, loginWithGoogle, loginWithApple } = useAuth();
    const role = type === 'admin' ? 'Admin' : (type === 'pro' || type === 'provider' ? 'Provider' : 'Customer');
    const showPremiumAlert = (message, title = 'Login Failed', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showPremiumAlert('Please enter both email and password');
            return;
        }
        setLoading(true);

        try {
            // Dedicated mobile endpoint for multi-role support
            const endpoint = '/api/auth/mobile/login';

            const response = await apiService.post(endpoint, {
                email,
                password,
                role: type || 'customer' // Defaults to customer if type is missing
            });

            if (response.success) {
                const userData = response.user || {};

                // Standardize role for the app
                if (userData.role === 'user') userData.role = 'customer';

                login(userData, response.token);

                // Handle Redirect if guest was trying to book
                const { redirectTo, redirectParams } = route.params || {};
                
                if (redirectTo) {
                    console.log(`🚀 [Login] Hard redirecting to ${redirectTo}`);
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [
                                { name: 'Main' },
                                { name: redirectTo, params: redirectParams }
                            ],
                        })
                    );
                } else {
                    console.log(`🚀 [Login] Success! Explicitly navigating to Main.`);
                    // Force navigation to Main to ensure the UI switches out of the Auth flow
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        })
                    );
                }
            } else {
                showPremiumAlert(response.message || 'Invalid credentials');
            }
        } catch (err) {
            if (err.status === 403 && err.data?.requiresVerification) {
                navigation.navigate('EmailVerification', {
                    email: err.data.email || email,
                    type: type || 'pro'
                });
                return;
            }
            showPremiumAlert(err.message || 'Connection failed. Please check your internet.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            // Role detection: if 'type' is 'pro' from route params, use provider role
            const role = type === 'pro' || type === 'provider' ? 'provider' : 'customer';
            const result = await loginWithGoogle(role, 'login');
            if (result.success) {
                console.log(`🚀 [GoogleAuth] Success! Explicitly navigating to Main.`);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    })
                );
            } else {
                showPremiumAlert(result.message);
            }
        } catch (err) {
            showPremiumAlert('Google Sign-In failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setAppleLoading(true);
        try {
            const role = type === 'pro' || type === 'provider' ? 'provider' : 'customer';
            const result = await loginWithApple(role);
            if (result.success) {
                console.log(`🚀 [AppleAuth] Success! Explicitly navigating to Main.`);
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    })
                );
            } else {
                showPremiumAlert(result.message);
            }
        } catch (err) {
            showPremiumAlert('Apple Sign-In failed');
        } finally {
            setAppleLoading(false);
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
                                source={require('../../../assets/login_worker.png')}
                                style={[
                                    styles.miniIllustration,
                                    isSmallDevice && { width: moderateScale(60), height: moderateScale(60) }
                                ]}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.title}>Welcome Back {role}</Text>
                        <Text style={styles.subtitle}>Sign in to your WorkOnTop account</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <PasswordInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="•••••••••"
                                inputStyle={styles.passwordInputInner}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword', { type })}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                            onPress={handleGoogleLogin}
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
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && (
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={moderateScale(15)}
                                style={styles.appleButton}
                                onPress={handleAppleLogin}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.signupFooter}
                            onPress={() => {
                                navigation.navigate('AuthChoice', { initialState: 'signup' });
                            }}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
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
        marginTop: verticalScale(25),
    },
    backIcon: {
        fontSize: Typography.h4,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    miniIllustration: {
        width: moderateScale(100),
        height: moderateScale(100),
        marginBottom: verticalScale(10),
    },
    title: {
        fontSize: Typography.h2,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.bodyLarge,
        color: '#64748b',
        textAlign: 'center',
        marginTop: verticalScale(4),
    },
    errorText: {
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        padding: moderateScale(10),
        borderRadius: moderateScale(10),
        marginBottom: verticalScale(15),
        textAlign: 'center',
        fontWeight: '600',
        fontSize: Typography.body,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: verticalScale(15),
    },
    label: {
        fontSize: Typography.label,
        fontWeight: '600',
        color: '#475569',
        marginBottom: verticalScale(6),
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        fontSize: Typography.bodyLarge,
        color: '#0f172a',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: verticalScale(20),
    },
    forgotPasswordText: {
        color: '#115e59',
        fontSize: Typography.body,
        fontWeight: '600',
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
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: Typography.h5,
        fontWeight: 'bold',
    },
    signupFooter: {
        marginTop: verticalScale(20),
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    signupText: {
        fontSize: Typography.bodyLarge,
        color: '#64748b',
    },
    signupLink: {
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
        fontSize: Typography.tiny,
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
        fontSize: Typography.bodyLarge,
        fontWeight: 'bold',
        letterSpacing: 0.2,
    },
    appleButton: {
        width: '100%',
        height: verticalScale(50),
        marginTop: verticalScale(14),
    }
});

export default LoginScreen;
