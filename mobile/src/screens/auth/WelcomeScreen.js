import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    Image,
    SafeAreaView
} from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onFinish }) => {
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
        <SafeAreaView style={styles.container}>
            <View style={styles.topSection}>
                <Text style={styles.brandText}>WorkOn<Text style={styles.brandBold}>Top</Text></Text>
                {/* <View style={styles.iconCircle}>
                    <View style={styles.iconInner}>
                        <Text style={styles.iconEmoji}>🛠️</Text>
                    </View>
                </View> */}
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
                    <TouchableOpacity style={styles.button} onPress={onFinish}>
                        <Text style={styles.buttonText}>Get Started Today</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // White background like the reference
    },
    topSection: {
        alignItems: 'center',
        marginTop: 80,
    },
    brandText: {
        fontSize: 30,
        color: '#0f172a',
        letterSpacing: 0.5,
    },
    brandBold: {
        fontWeight: 'bold',
    },

    // iconCircle: {
    //     marginTop: 20,
    //     width: 70,
    //     height: 70,
    //     borderRadius: 35,
    //     backgroundColor: '#f1f5f9',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    // iconInner: {
    //     width: 50,
    //     height: 50,
    //     borderRadius: 25,
    //     backgroundColor: '#14b8a6',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 3,
    //     elevation: 4,
    // },
    // iconEmoji: {
    //     fontSize: 24,
    // },

    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        width: width * 0.9,
        height: height * 0.4,
    },
    bottomSection: {
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    heading: {
        fontSize: 32,
        fontWeight: '600',
        color: '#0f172a',
        textAlign: 'center',
        lineHeight: 42,
        marginBottom: 40,
    },
    italic: {
        fontStyle: 'italic',
        fontWeight: '300',
    },
    buttonWrapper: {
        width: '100%',
    },
    button: {
        backgroundColor: '#115e59', // Dark teal like the reference button
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default WelcomeScreen;
