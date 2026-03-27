import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale } from '../utils/responsive';

const OnboardingStepper = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Profile', icon: 'person-outline' },
        { id: 2, label: 'Documents', icon: 'document-text-outline' },
        { id: 3, label: 'Payment', icon: 'card-outline' },
        { id: 4, label: 'Review', icon: 'checkmark-done-outline' },
    ];

    return (
        <View style={styles.container}>
            {steps.map((step, index) => (
                <View key={step.id} style={styles.stepWrapper}>
                    <View style={styles.stepItem}>
                        <View style={[
                            styles.circle,
                            currentStep >= step.id ? styles.activeCircle : styles.inactiveCircle
                        ]}>
                            {currentStep > step.id ? (
                                <Ionicons name="checkmark" size={moderateScale(16)} color="#fff" />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    currentStep >= step.id ? styles.activeStepNumber : styles.inactiveStepNumber
                                ]}>
                                    {step.id}
                                </Text>
                            )}
                        </View>
                        <Text style={[
                            styles.label,
                            currentStep >= step.id ? styles.activeLabel : styles.inactiveLabel
                        ]}>
                            {step.label}
                        </Text>
                    </View>
                    {index < steps.length - 1 && (
                        <View style={[
                            styles.line,
                            currentStep > step.id ? styles.activeLine : styles.inactiveLine
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(20),
        backgroundColor: '#fff',
        width: '100%',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepItem: {
        alignItems: 'center',
        width: scale(65),
    },
    circle: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateScale(6),
        borderWidth: 2,
    },
    activeCircle: {
        backgroundColor: '#115e59', // Teal 800
        borderColor: '#115e59',
    },
    inactiveCircle: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    stepNumber: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
    activeStepNumber: {
        color: '#fff',
    },
    inactiveStepNumber: {
        color: '#9ca3af',
    },
    label: {
        fontSize: moderateScale(10),
        fontWeight: '600',
    },
    activeLabel: {
        color: '#115e59',
    },
    inactiveLabel: {
        color: '#9ca3af',
    },
    line: {
        width: scale(25),
        height: 2,
        marginTop: -moderateScale(20), // Align with circles
    },
    activeLine: {
        backgroundColor: '#115e59',
    },
    inactiveLine: {
        backgroundColor: '#e5e7eb',
    },
});

export default OnboardingStepper;
