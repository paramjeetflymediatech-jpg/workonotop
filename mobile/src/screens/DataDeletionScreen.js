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
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const DataDeletionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, token } = useAuth();
    
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getWordCount = (text) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const handleSubmit = async () => {
        if (!password) {
            setErrorMessage('Password is required for verification.');
            setShowError(true);
            return;
        }

        const wordCount = getWordCount(reason);
        if (wordCount > 500) {
            setErrorMessage('Reason for deletion cannot exceed 500 words.');
            setShowError(true);
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.post('/api/auth/data-deletion', {
                email: user?.email,
                password: password,
                reason: reason.trim()
            }, token);

            if (response.success) {
                setSuccessMessage(response.message);
                setShowSuccess(true);
                setReason('');
                setPassword('');
            } else {
                setErrorMessage(response.message || 'Failed to submit request.');
                setShowError(true);
            }
        } catch (error) {
            console.error('Data deletion submission error:', error);
            setErrorMessage(error.message || 'Something went wrong. Please try again later.');
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    const wordCount = getWordCount(reason);

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={moderateScale(48)} color="#ef4444" />
                <Text style={styles.warningTitle}>Wait! Read this carefully</Text>
                <Text style={styles.warningText}>
                    Deleting your account is a serious action. Please be aware of the following:
                </Text>
            </View>

            <View style={styles.bulletPoints}>
                <View style={styles.bulletItem}>
                    <Ionicons name="close-circle" size={moderateScale(20)} color="#ef4444" />
                    <Text style={styles.bulletText}>All your active bookings will be cancelled.</Text>
                </View>
                <View style={styles.bulletItem}>
                    <Ionicons name="close-circle" size={moderateScale(20)} color="#ef4444" />
                    <Text style={styles.bulletText}>Your job history and reviews will be removed.</Text>
                </View>
                <View style={styles.bulletItem}>
                    <Ionicons name="hourglass" size={moderateScale(20)} color="#b45309" />
                    <Text style={styles.bulletText}>48-hour Grace Period: Your account will be restricted for 48 hours before permanent anonymization.</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setStep(2)}
            >
                <Text style={styles.primaryButtonText}>I Understand, Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.secondaryButtonText}>Keep My Account</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Verify Identity</Text>
                <Text style={styles.subLabel}>Please enter your password to confirm this request.</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Reason for Deletion (Optional)</Text>
                    <Text style={[
                        styles.counter,
                        wordCount > 500 && styles.errorCounter
                    ]}>
                        {wordCount}/500 words
                    </Text>
                </View>
                <TextInput
                    style={[
                        styles.textArea,
                        wordCount > 500 && styles.errorInput
                    ]}
                    placeholder="Why are you leaving us?"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity 
                style={[styles.deleteButton, (loading || !password || wordCount > 500) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading || !password || wordCount > 500}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.deleteButtonText}>Permanently Delete My Account</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backLink}
                onPress={() => setStep(1)}
                disabled={loading}
            >
                <Text style={styles.backLinkText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Deletion</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, step >= 1 && styles.activeDot]} />
                        <View style={styles.stepLine} />
                        <View style={[styles.stepDot, step >= 2 && styles.activeDot]} />
                    </View>

                    {step === 1 ? renderStep1() : renderStep2()}
                </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal
                visible={showSuccess}
                title="Request Submitted"
                message={successMessage}
                onOk={() => {
                    setShowSuccess(false);
                    navigation.goBack();
                }}
            />

            <ErrorModal
                visible={showError}
                title="Error"
                message={errorMessage}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(20),
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        padding: scale(24),
        flexGrow: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(30),
    },
    stepDot: {
        width: moderateScale(14),
        height: moderateScale(14),
        borderRadius: moderateScale(7),
        backgroundColor: '#e2e8f0',
    },
    activeDot: {
        backgroundColor: '#115e59',
    },
    stepLine: {
        width: scale(40),
        height: 2,
        backgroundColor: '#e2e8f0',
        marginHorizontal: scale(8),
    },
    stepContainer: {
        flex: 1,
    },
    warningBox: {
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: moderateScale(20),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: '#fee2e2',
        marginBottom: verticalScale(24),
    },
    warningTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#991b1b',
        marginTop: verticalScale(12),
        marginBottom: verticalScale(8),
    },
    warningText: {
        fontSize: moderateScale(14),
        color: '#b91c1c',
        textAlign: 'center',
        lineHeight: moderateScale(20),
    },
    bulletPoints: {
        marginBottom: verticalScale(30),
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: verticalScale(16),
        paddingRight: scale(20),
    },
    bulletText: {
        fontSize: moderateScale(14),
        color: '#475569',
        marginLeft: scale(12),
        lineHeight: moderateScale(20),
    },
    primaryButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#f8fafc',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    secondaryButtonText: {
        color: '#475569',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: verticalScale(24),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: verticalScale(4),
    },
    subLabel: {
        fontSize: moderateScale(13),
        color: '#64748b',
        marginBottom: verticalScale(12),
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    textArea: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
        height: verticalScale(100),
    },
    counter: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
    },
    errorCounter: {
        color: '#ef4444',
    },
    errorInput: {
        borderColor: '#fca5a5',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    backLink: {
        alignItems: 'center',
        marginTop: verticalScale(20),
    },
    backLinkText: {
        color: '#64748b',
        fontSize: moderateScale(14),
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default DataDeletionScreen;
