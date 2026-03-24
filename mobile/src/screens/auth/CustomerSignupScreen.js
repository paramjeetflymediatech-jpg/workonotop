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
    Switch,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { Alert } from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const CustomerSignupScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        referral: '',
    });
    const [isNewsletterEnabled, setIsNewsletterEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSignup = async () => {
        const { firstName, lastName, email, phone, password, confirmPassword, referral } = formData;

        // Basic presence check
        if (!firstName || !lastName || !email || !password || !phone) {
            setError('Please fill in all required fields');
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

        // Phone validation (10-15 digits)
        const phoneRegex = /^\+?[\d\s-]{10,15}$/;
        if (!phoneRegex.test(phone.trim())) {
            setError('Phone number must be between 10 and 15 digits.');
            setShowError(true);
            return;
        }

        // Password validation (min 6 chars)
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
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
            const response = await apiService.post('/api/auth/signup', {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                password: password,
                hear_about: referral,
                receive_offers: isNewsletterEnabled
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
                        <Text style={styles.title}>Create Account</Text>
                        {!isSmallDevice && (
                            <Text style={styles.subtitle}>Join WorkOnTap to book trusted pros</Text>
                        )}
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Login', { type: 'customer' })}>
                            <Text style={styles.tabText}>Log In</Text>
                        </TouchableOpacity>
                        <View style={styles.activeTab}>
                            <Text style={styles.activeTabText}>Sign Up</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: scale(10) }]}>
                                <Text style={styles.label}>First Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Last Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email *</Text>
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
                            <Text style={styles.label}>Phone *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 (403) 000-0000"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: scale(10) }]}>
                                <PasswordInput
                                    label="Password *"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="•••••••••"
                                    inputStyle={styles.passwordInputInner}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <PasswordInput
                                    label="Confirm *"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    placeholder="••••••••"
                                    inputStyle={styles.passwordInputInner}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>How did you hear about us?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. social media..."
                                value={formData.referral}
                                onChangeText={(text) => setFormData({ ...formData, referral: text })}
                            />
                        </View>

                        <View style={styles.checkboxContainer}>
                            <Switch
                                trackColor={{ false: "#e2e8f0", true: "#115e59" }}
                                thumbColor={isNewsletterEnabled ? "#fff" : "#f4f3f4"}
                                onValueChange={() => setIsNewsletterEnabled(p => !p)}
                                value={isNewsletterEnabled}
                            />
                            <Text style={styles.checkboxLabel}>
                                Yes! I'd like to receive news and special offers.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By signing up you agree to WorkOnTap's <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal 
                visible={showSuccess}
                title="Success"
                message="Account created successfully! Please log in."
                onOk={() => {
                    setShowSuccess(false);
                    navigation.navigate('Login', { type: 'customer' });
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
        marginBottom: verticalScale(15),
    },
    title: {
        fontSize: moderateScale(30),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: moderateScale(15),
        color: '#64748b',
        marginTop: verticalScale(4),
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: verticalScale(20),
    },
    tab: {
        paddingVertical: verticalScale(10),
        marginRight: scale(24),
    },
    activeTab: {
        paddingVertical: verticalScale(10),
        borderBottomWidth: 3,
        borderBottomColor: '#115e59',
    },
    tabText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#115e59',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
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
        padding: moderateScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(15),
        paddingRight: scale(40),
    },
    checkboxLabel: {
        fontSize: moderateScale(13),
        color: '#64748b',
        marginLeft: scale(10),
        lineHeight: moderateScale(18),
    },
    submitButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginTop: verticalScale(10),
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
    termsText: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: verticalScale(15),
        marginBottom: verticalScale(30),
        lineHeight: moderateScale(16),
    },
    link: {
        color: '#115e59',
        fontWeight: '600',
    }
});

export default CustomerSignupScreen;
