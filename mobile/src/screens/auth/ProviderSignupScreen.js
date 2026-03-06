import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';

const ProviderSignupScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSignup = () => {
        // Logic for provider signup
        console.log('Provider Signup:', formData);
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
                            <Text style={styles.label}>Phone Number</Text>
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
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="•••••••••"
                                    secureTextEntry
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Confirm</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                            <Text style={styles.submitButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login', { type: 'pro' })}>
                            <Text style={styles.footerText}>
                                Already a Pro? <Text style={styles.footerLink}>Sign in</Text>
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
    }
});

export default ProviderSignupScreen;
