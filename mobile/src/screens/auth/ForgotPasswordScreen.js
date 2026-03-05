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
    Image,
    Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const route = useRoute();
    const { type } = route.params || {};
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Image
                            source={require('../../../assets/forgot_worker.png')}
                            style={styles.miniIllustration}
                            resizeMode="contain"
                        />
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
                                    <Text style={styles.buttonText}>Send Reset Link</Text>
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
        padding: 24,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    backIcon: {
        fontSize: 20,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    miniIllustration: {
        width: 140,
        height: 140,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0f172a',
    },
    button: {
        backgroundColor: '#115e59',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#115e59',
    },
    secondaryButtonText: {
        color: '#115e59',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 15,
        color: '#64748b',
    },
    footerLink: {
        color: '#115e59',
        fontWeight: 'bold',
    },
    successSection: {
        marginTop: 20,
    }
});

export default ForgotPasswordScreen;
