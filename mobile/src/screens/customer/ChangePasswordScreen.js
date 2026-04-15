import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#115e59';

const ChangePasswordScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleUpdate = async () => {
        const { oldPassword, newPassword, confirmPassword } = form;

        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            Alert.alert('Error', 'New password must be at least 8 characters and contain both alphabets and special characters.');
            return;
        }

        try {
            setLoading(true);
            const res = await apiService.auth.changePassword({ oldPassword, newPassword }, token);

            if (res.success) {
                Alert.alert('Success', 'Password updated successfully.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to update password.');
            }
        } catch (error) {
            console.error('Change password error:', error);
            Alert.alert('Error', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: moderateScale(40) }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <Ionicons name="shield-checkmark" size={40} color={PRIMARY} />
                        <Text style={styles.infoTitle}>Secure Your Account</Text>
                        <Text style={styles.infoDesc}>
                            Update your password regularly to keep your account safe.
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                secureTextEntry={!showOldPass}
                                value={form.oldPassword}
                                onChangeText={(val) => setForm({ ...form, oldPassword: val })}
                            />
                            <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)} style={styles.eyeIcon}>
                                <Ionicons name={showOldPass ? "eye-off" : "eye"} size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                secureTextEntry={!showNewPass}
                                value={form.newPassword}
                                onChangeText={(val) => setForm({ ...form, newPassword: val })}
                            />
                            <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeIcon}>
                                <Ionicons name={showNewPass ? "eye-off" : "eye"} size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Repeat new password"
                                secureTextEntry={!showConfirmPass}
                                value={form.confirmPassword}
                                onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
                                <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: 20 },
    infoBox: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#f0fdfa',
        padding: 20,
        borderRadius: 20,
    },
    infoTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 10 },
    infoDesc: { textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 5 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
    },
    eyeIcon: { padding: 12 },
    btn: {
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ChangePasswordScreen;
