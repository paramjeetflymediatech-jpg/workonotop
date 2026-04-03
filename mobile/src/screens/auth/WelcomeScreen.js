import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../utils/responsive';

const WelcomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const buttonFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Fade in button after entrance
            Animated.timing(buttonFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        });

        // Floating animation for the illustration
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const floatY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15], // Moves up by 15 units
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.topSection}>
                <Text style={styles.brandText}>WorkOn<Text style={styles.brandBold}>Top</Text></Text>
            </View>

            <Animated.View
                style={[
                    styles.imageContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: floatY }]
                    }
                ]}
            >
                <Image
                    source={require('../../../assets/workers.png')}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </Animated.View>

            <View style={styles.bottomSection}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={styles.heading}>
                        Stay on Top of Every <Text style={styles.italic}>Job</Text>, One Task at a Time.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.buttonWrapper, { opacity: buttonFadeAnim }]}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.replace('AuthChoice')}>
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSection: {
        alignItems: 'center',
        marginTop: verticalScale(40),
    },
    brandText: {
        fontSize: moderateScale(30),
        color: '#0f172a',
        letterSpacing: 0.5,
    },
    brandBold: {
        fontWeight: 'bold',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.4,
    },
    bottomSection: {
        paddingHorizontal: scale(40),
        paddingBottom: verticalScale(60),
    },
    heading: {
        fontSize: moderateScale(32),
        fontWeight: '600',
        color: '#0f172a',
        textAlign: 'center',
        lineHeight: moderateScale(42),
        marginBottom: verticalScale(40),
    },
    italic: {
        fontStyle: 'italic',
        fontWeight: '300',
    },
    buttonWrapper: {
        width: '100%',
    },
    button: {
        backgroundColor: '#115e59',
        paddingVertical: verticalScale(18),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(23),
        fontWeight: '600',
    },
});

export default WelcomeScreen;
