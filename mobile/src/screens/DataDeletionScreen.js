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
    
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getWordCount = (text) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const handleSubmit = async () => {
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
                reason: reason.trim()
            }, token);

            if (response.success) {
                setSuccessMessage(response.message);
                setShowSuccess(true);
                setReason('');
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

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data Deletion</Text>
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
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="warning-outline" size={moderateScale(24)} color="#b45309" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Account Deletion Request</Text>
                            <Text style={styles.infoDescription}>
                                This action is permanent and cannot be undone. All your personal data, job history, and settings will be permanently removed.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Registered Email</Text>
                            <View style={styles.disabledInput}>
                                <Text style={styles.disabledInputText}>{user?.email}</Text>
                                <Ionicons name="lock-closed-outline" size={16} color="#94a3b8" />
                            </View>
                            <Text style={styles.helperText}>Your request will be processed for this account.</Text>
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
                                placeholder="Tell us why you'd like to delete your data..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                numberOfLines={6}
                                value={reason}
                                onChangeText={setReason}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (loading || wordCount > 500) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={loading || wordCount > 500}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Deletion Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal
                visible={showSuccess}
                title="Request Received"
                message={successMessage}
                onOk={() => {
                    setShowSuccess(false);
                    navigation.goBack();
                }}
            />

            <ErrorModal
                visible={showError}
                title="Submission Error"
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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: '#fef3c7',
        marginBottom: verticalScale(24),
    },
    infoIconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: verticalScale(4),
    },
    infoDescription: {
        fontSize: moderateScale(13),
        lineHeight: moderateScale(18),
        color: '#b45309',
    },
    formSection: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: verticalScale(24),
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#475569',
        marginBottom: verticalScale(8),
    },
    disabledInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
    },
    disabledInputText: {
        flex: 1,
        fontSize: moderateScale(15),
        color: '#64748b',
    },
    helperText: {
        fontSize: moderateScale(12),
        color: '#94a3b8',
        marginTop: verticalScale(8),
    },
    textArea: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        fontSize: moderateScale(15),
        color: '#0f172a',
        height: verticalScale(120),
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
    submitButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        marginTop: verticalScale(10),
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
});

export default DataDeletionScreen;
