import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PremiumAlert from '../../components/PremiumAlert';

const CommissionSetupScreen = ({ navigation }) => {
    const { token } = useAuth();
    const [commission, setCommission] = useState('');
    const [originalCommission, setOriginalCommission] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });

    const fetchSettings = async () => {
        try {
            const response = await apiService.admin.getSettings(token);
            if (response.success && response.settings) {
                const val = response.settings.default_commission?.toString() || '0';
                setCommission(val);
                setOriginalCommission(val);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showPremiumAlert('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (commission === '' || isNaN(commission)) {
            showPremiumAlert('Please enter a valid commission percentage.');
            return;
        }

        const value = parseFloat(commission);
        if (value < 0 || value > 100) {
            showPremiumAlert('Commission must be between 0 and 100.');
            return;
        }

        setSaving(true);
        try {
            const response = await apiService.admin.updateSetting('default_commission', commission, token);
            if (response.success) {
                showPremiumAlert('Commission rate has been updated successfully.', 'Success', 'success');
                setOriginalCommission(commission);
                setIsEditing(false);
                // Re-fetch to confirm server state
                fetchSettings();
            } else {
                showPremiumAlert(response.message || 'Failed to update commission.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showPremiumAlert('Connection failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setCommission(originalCommission);
        setIsEditing(false);
    };

    const showPremiumAlert = (message, title = 'Error', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#15843E" />
                <Text style={styles.loaderText}>Loading Settings...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu-outline" size={moderateScale(28)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Commission Setup</Text>
                    <View style={{ width: moderateScale(28) }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="pie-chart" size={moderateScale(40)} color="#15843E" />
                            </View>
                        </View>

                        <Text style={styles.cardTitle}>Platform Commission</Text>
                        <Text style={styles.cardSubtitle}>
                            Set the default percentage taken from each job. This applies to all new bookings unless overridden.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Default Commission (%)</Text>
                                {!isEditing && (
                                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                                        <Text style={styles.editLink}>Edit Option</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={[styles.inputContainer, !isEditing && styles.readOnlyInput]}>
                                <TextInput
                                    style={[styles.input, !isEditing && styles.readOnlyText]}
                                    value={commission}
                                    onChangeText={setCommission}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    editable={isEditing}
                                />
                                <Text style={styles.percentSign}>%</Text>
                            </View>
                        </View>

                        {isEditing ? (
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, { flex: 1.5 }, saving && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color="#fff" />
                                            <Text style={styles.saveButtonText}>Save Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.primaryEditBtn}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="pencil-outline" size={moderateScale(20)} color="#fff" />
                                <Text style={styles.saveButtonText}>Edit Commission</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={moderateScale(20)} color="#64748b" />
                        <Text style={styles.infoText}>
                            Existing bookings will not be affected by this change. This rate will be applied to all future job posts automatically.
                        </Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loaderText: {
        marginTop: verticalScale(10),
        color: '#64748b',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        padding: scale(20),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: scale(24),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        marginBottom: verticalScale(20),
    },
    iconCircle: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: '#15843E10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(8),
    },
    cardSubtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: moderateScale(20),
        marginBottom: verticalScale(24),
    },
    inputWrapper: {
        width: '100%',
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
    },
    editLink: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#15843E',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    readOnlyInput: {
        backgroundColor: '#f8fafc',
        borderColor: '#f1f5f9',
    },
    input: {
        flex: 1,
        paddingVertical: verticalScale(12),
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    readOnlyText: {
        color: '#64748b',
    },
    percentSign: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: scale(12),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#15843E',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#15843E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryEditBtn: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#15843E',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#15843E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: moderateScale(12),
        padding: scale(16),
        marginTop: verticalScale(20),
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(12),
        color: '#64748b',
        marginLeft: scale(12),
        lineHeight: moderateScale(18),
    },
});

export default CommissionSetupScreen;
