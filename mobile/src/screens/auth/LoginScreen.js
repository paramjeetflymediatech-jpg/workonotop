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
import { useRoute } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import PasswordInput from '../../components/PasswordInput';
import PremiumAlert from '../../components/PremiumAlert';

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { type } = route.params || {};
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const { login, loginWithGoogle } = useAuth();

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

            const response = await apiService.post(endpoint, { email, password });

            if (response.success) {
                const userData = response.user || {};

                // Standardize role for the app
                if (userData.role === 'user') userData.role = 'customer';

                login(userData, response.token);
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
            if (!result.success) {
                showPremiumAlert(result.message);
            }
        } catch (err) {
            showPremiumAlert('Google Sign-In failed');
        } finally {
            setGoogleLoading(false);
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
                        <Text style={styles.title}>Welcome Back</Text>
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
                                    <View style={styles.googleIconContainer}>
                                        <Text style={styles.googleIconText}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>

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
        fontSize: moderateScale(20),
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
    },
    errorText: {
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        padding: moderateScale(10),
        borderRadius: moderateScale(10),
        marginBottom: verticalScale(15),
        textAlign: 'center',
        fontWeight: '600',
        fontSize: moderateScale(14),
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: verticalScale(15),
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
        padding: moderateScale(14),
        fontSize: moderateScale(16),
        color: '#0f172a',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: verticalScale(20),
    },
    forgotPasswordText: {
        color: '#115e59',
        fontSize: moderateScale(14),
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
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    signupFooter: {
        marginTop: verticalScale(20),
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    signupText: {
        fontSize: moderateScale(15),
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
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIconContainer: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    googleIconText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
    googleButtonText: {
        color: '#0f172a',
        fontSize: moderateScale(16),
        fontWeight: '600',
    }
});

export default LoginScreen;
