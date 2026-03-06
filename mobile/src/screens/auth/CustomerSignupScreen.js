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
    Switch
} from 'react-native';
import { scale, verticalScale, moderateScale, SCREEN_HEIGHT } from '../../utils/responsive';

const CustomerSignupScreen = ({ navigation }) => {
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

    const handleSignup = () => {
        // Logic for customer signup
        console.log('Customer Signup:', { ...formData, newsletter: isNewsletterEnabled });
    };

    const isSmallDevice = SCREEN_HEIGHT < 750;

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
                                <Text style={styles.label}>Password *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="•••••••••"
                                    secureTextEntry
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Confirm *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
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

                        <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                            <Text style={styles.submitButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By signing up you agree to WorkOnTap's <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy</Text>
                        </Text>
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
