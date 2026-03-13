import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const ErrorModal = ({ visible, title, message, onOk }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onOk}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-circle" size={moderateScale(40)} color="#ef4444" />
                    </View>
                    <Text style={styles.title}>{title || 'Error'}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity style={styles.button} onPress={onOk}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20)
    },
    alertBox: {
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
    iconContainer: {
        width: moderateScale(70),
        height: moderateScale(70),
        borderRadius: moderateScale(35),
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(8),
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
    button: {
        width: '100%',
        paddingVertical: verticalScale(16),
        backgroundColor: '#115e59',
        borderRadius: moderateScale(15),
        alignItems: 'center',
        shadowColor: '#115e59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold'
    }
});

export default ErrorModal;
