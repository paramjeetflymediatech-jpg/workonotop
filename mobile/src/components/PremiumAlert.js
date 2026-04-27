import React, { useEffect, useRef } from 'react';
import {
    Modal, View, Text, StyleSheet, TouchableOpacity,
    Animated, Dimensions, Platform
} from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PremiumAlert = ({ visible, type = 'error', title, message, onClose }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const isError = type === 'error';
    const mainColor = isError ? '#ef4444' : '#15843E';
    const iconName = isError ? 'alert-circle' : 'checkmark-circle';

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[
                    styles.alertBox,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <View style={[styles.glow, { shadowColor: mainColor }]} />

                    <View style={[styles.iconContainer, { backgroundColor: isError ? '#fef2f2' : '#f0fdfa', borderColor: isError ? '#fee2e2' : '#ccfbf1' }]}>
                        <Ionicons name={iconName} size={moderateScale(40)} color={mainColor} />
                    </View>

                    <Text style={styles.title}>{title || (isError ? 'Oops!' : 'Success')}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: mainColor, shadowColor: mainColor }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Got it</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)', // Deep dark premium overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(30)
    },
    alertBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: moderateScale(30),
        padding: moderateScale(24),
        alignItems: 'center',
        elevation: 20,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        position: 'relative',
        overflow: 'hidden'
    },
    glow: {
        position: 'absolute',
        top: -moderateScale(50),
        width: moderateScale(200),
        height: moderateScale(200),
        borderRadius: moderateScale(100),
        opacity: 0.05,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 40,
        elevation: 0,
        zIndex: -1
    },
    iconContainer: {
        width: moderateScale(70),
        height: moderateScale(70),
        borderRadius: moderateScale(22),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        borderWidth: 1.5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            }
        })
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: verticalScale(12),
        textAlign: 'center',
        letterSpacing: -0.5
    },
    message: {
        fontSize: moderateScale(15),
        color: '#64748b',
        textAlign: 'center',
        marginBottom: verticalScale(32),
        lineHeight: moderateScale(24),
        paddingHorizontal: scale(10),
        fontWeight: '500'
    },
    button: {
        width: '100%',
        paddingVertical: verticalScale(18),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(17),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1
    }
});

export default PremiumAlert;
