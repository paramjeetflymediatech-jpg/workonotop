import React, { useState } from 'react';
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
    Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import PasswordInput from '../../components/PasswordInput';

const LoginScreen = ({ navigation }) => {
    const route = useRoute();
    const { type } = route.params || {};
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Unified endpoint for all roles (customer, provider, admin)
            const endpoint = '/api/auth/login';

            const response = await apiService.post(endpoint, { email, password });

            if (response.success) {
                const userData = response.user || {};

                // Standardize role for the app
                if (userData.role === 'user') userData.role = 'customer';

                login(userData, response.token);
            } else {
                setError(response.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Please check your internet.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isSmallDevice = SCREEN_HEIGHT < 750;
    const isVerySmallDevice = SCREEN_HEIGHT < 650;

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
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
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
    }
});

export default LoginScreen;
