import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const LogoutConfirmationModal = ({ visible, onCancel, onConfirm }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconWrapper}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="log-out-outline" size={moderateScale(32)} color="#ef4444" />
                        </View>
                    </View>
                    
                    <Text style={styles.title}>Logging Out?</Text>
                    <Text style={styles.message}>Are you sure you want to log out? You'll need to enter your credentials to log back in.</Text>
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Stay Logged In</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.confirmButton} 
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>Yes, Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep slate with opacity
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(24),
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10
    },
    iconWrapper: {
        marginBottom: verticalScale(20),
    },
    iconCircle: {
        width: moderateScale(70),
        height: moderateScale(70),
        borderRadius: moderateScale(35),
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(12),
        textAlign: 'center'
    },
    message: {
        fontSize: moderateScale(15),
        color: '#64748b',
        textAlign: 'center',
        marginBottom: verticalScale(32),
        lineHeight: moderateScale(22),
        paddingHorizontal: scale(10)


    },
    buttonContainer: {
        width: '100%',
    },
    confirmButton: {
        width: '100%',
        paddingVertical: verticalScale(16),
        backgroundColor: '#ef4444',
        borderRadius: moderateScale(14),
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold'
    },
    cancelButton: {
        width: '100%',
        paddingVertical: verticalScale(16),
        backgroundColor: '#f8fafc',
        borderRadius: moderateScale(14),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: verticalScale(12),
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: moderateScale(16),
        fontWeight: '600'
    }
});

export default LogoutConfirmationModal;
