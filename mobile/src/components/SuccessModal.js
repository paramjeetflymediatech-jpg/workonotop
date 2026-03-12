import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const SuccessModal = ({ visible, title, message, onOk }) => {
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
                        <Text style={styles.icon}>✓</Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20)
    },
    alertBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(24),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    iconContainer: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: '#dcfce3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16)
    },
    icon: {
        fontSize: moderateScale(30),
        color: '#16a34a',
        fontWeight: 'bold'
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(8),
        textAlign: 'center'
    },
    message: {
        fontSize: moderateScale(15),
        color: '#475569',
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: moderateScale(22)
    },
    button: {
        width: '100%',
        paddingVertical: verticalScale(14),
        backgroundColor: '#115e59',
        borderRadius: moderateScale(12),
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold'
    }
});

export default SuccessModal;
