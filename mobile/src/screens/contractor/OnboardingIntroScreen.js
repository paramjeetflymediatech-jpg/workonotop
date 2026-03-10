import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView
} from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';

const OnboardingIntroScreen = ({ navigation }) => {
    const { logout } = useAuth();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={require('../../../assets/workers.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Join Our Pro Network</Text>
                    <Text style={styles.subtitle}>
                        Complete these 4 simple steps to start earning with WorkOnTop
                    </Text>
                </View>

                <View style={styles.stepsContainer}>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>Profile Setup</Text>
                            <Text style={styles.stepDesc}>Tell us about your skills and experience</Text>
                        </View>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>Documents</Text>
                            <Text style={styles.stepDesc}>Upload ID proof and trade certifications</Text>
                        </View>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>Payment</Text>
                            <Text style={styles.stepDesc}>Link your bank account via Stripe</Text>
                        </View>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>Review</Text>
                            <Text style={styles.stepDesc}>Our team will verify your application</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('ProfileSetup')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.laterButton}
                    onPress={logout}
                >
                    <Text style={styles.laterText}>Logout & Do it later</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: scale(24),
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(40),
    },
    illustration: {
        width: moderateScale(150),
        height: moderateScale(150),
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: moderateScale(16),
        color: '#64748b',
        textAlign: 'center',
        marginTop: verticalScale(10),
        lineHeight: moderateScale(24),
    },
    stepsContainer: {
        width: '100%',
        marginBottom: verticalScale(40),
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    stepNumber: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#f0fdfa',
        borderWidth: 1,
        borderColor: '#115e59',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    stepNumberText: {
        color: '#115e59',
        fontWeight: 'bold',
        fontSize: moderateScale(16),
    },
    stepInfo: {
        flex: 1,
    },
    stepTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    stepDesc: {
        fontSize: moderateScale(14),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    button: {
        backgroundColor: '#115e59',
        width: '100%',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    laterButton: {
        marginTop: verticalScale(20),
        padding: moderateScale(10),
    },
    laterText: {
        color: '#64748b',
        fontSize: moderateScale(14),
        fontWeight: '600',
    }
});

export default OnboardingIntroScreen;
