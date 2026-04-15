import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const OfflineScreen = ({ onRetry }) => {
    // Subtle animation for the icon
    const shakeAnimation = new Animated.Value(0);

    React.useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeAnimation, {
                        toValue: 10,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: -10,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        };
        startAnimation();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <Animated.View style={[
                    styles.iconCircle,
                    { transform: [{ translateY: shakeAnimation }] }
                ]}>
                    <Ionicons name="cloud-offline-outline" size={moderateScale(80)} color="#0d9488" />
                </Animated.View>

                <Text style={styles.title}>No Internet Connection</Text>
                <Text style={styles.subtitle}>
                    It looks like you're offline. Please check your internet connection or mobile data and try again.
                </Text>

                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Ionicons name="refresh" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.retryText}>Retry Connection</Text>
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                    Automatic retry will occur once connection is restored.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        zIndex: 9999, // Ensure it's on top
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(40),
    },
    iconCircle: {
        width: moderateScale(160),
        height: moderateScale(160),
        borderRadius: moderateScale(80),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(40),
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    title: {
        fontSize: moderateScale(26),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: verticalScale(15),
    },
    subtitle: {
        fontSize: moderateScale(16),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: moderateScale(24),
        marginBottom: verticalScale(50),
    },
    retryButton: {
        backgroundColor: '#0d9488',
        flexDirection: 'row',
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(40),
        borderRadius: moderateScale(30),
        alignItems: 'center',
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    footerNote: {
        marginTop: verticalScale(30),
        fontSize: moderateScale(13),
        color: '#94a3b8',
        fontStyle: 'italic',
    }
});

export default OfflineScreen;
