import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AuthChoiceScreen = ({ navigation }) => {
    // 'initial' | 'login' | 'signup'
    const [viewState, setViewState] = useState('initial');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const changeView = (state) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewState(state);
    };

    const renderInitial = () => (
        <View style={styles.buttonGroup}>
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => changeView('login')}
            >
                <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => changeView('signup')}
            >
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLoginOptions = () => (
        <View style={styles.buttonGroup}>
            <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('Login', { type: 'customer' })}
            >
                <Text style={styles.roleButtonText}>Customer Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('Login', { type: 'pro' })}
            >
                <Text style={styles.roleButtonText}>Pro Login</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => changeView('initial')}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity> */}
        </View>
    );

    const renderSignUpOptions = () => (
        <View style={styles.buttonGroup}>
            <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('CustomerSignup')}
            >
                <Text style={styles.roleButtonText}>Customer Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('ProviderSignup')}
            >
                <Text style={styles.roleButtonText}>Become a Pro</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => changeView('initial')}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity> */}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={() => navigation.navigate('Login', { type: 'admin' })}
                    delayLongPress={5000}
                >
                    <Text style={styles.brandText}>WorkOn<Text style={styles.brandBold}>Top</Text></Text>
                </TouchableOpacity>
            </View>

            {/* Center Illustration - New "Worker in Action" Image */}
            <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
                <Image
                    source={require('../../../assets/worker_action.png')}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Bottom Content Section */}
            <View style={styles.bottomSection}>
                <Text style={styles.title}>
                    {viewState === 'initial' ? 'Welcome Back!' :
                        viewState === 'login' ? 'Login As' : 'Join Us As'}
                </Text>

                {viewState === 'initial' && renderInitial()}
                {viewState === 'login' && renderLoginOptions()}
                {viewState === 'signup' && renderSignUpOptions()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        marginTop: verticalScale(50),
    },
    brandText: {
        fontSize: moderateScale(24),
        color: '#0f172a',
        letterSpacing: 0.5,
    },
    brandBold: {
        fontWeight: 'bold',
    },
    imageContainer: {
        flex: 1, // Takes up remaining space to push section to bottom
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: verticalScale(20),
    },
    illustration: {
        width: SCREEN_WIDTH * 0.85,
        height: '100%',
    },
    bottomSection: {
        paddingHorizontal: scale(30),
        paddingBottom: verticalScale(40),
        width: '100%',
    },
    title: {
        fontSize: moderateScale(28),
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: verticalScale(24),
        textAlign: 'center',
    },
    buttonGroup: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(18),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: verticalScale(18),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#115e59',
    },
    secondaryButtonText: {
        color: '#115e59',
        fontSize: moderateScale(18),
        fontWeight: '600',
    },
    roleButton: {
        backgroundColor: '#f8fafc',
        paddingVertical: verticalScale(20),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    roleButtonText: {
        color: '#0f172a',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    // backText: {
    //     textAlign: 'center',
    //     marginTop: verticalScale(12),
    //     color: '#64748b',
    //     fontSize: moderateScale(16),
    //     fontWeight: '500',
    // }
});

export default AuthChoiceScreen;
