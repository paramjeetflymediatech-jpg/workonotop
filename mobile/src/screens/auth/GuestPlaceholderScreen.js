import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import Typography from '../../theme/Typography';

const PRIMARY = '#115e59';

const GuestPlaceholderScreen = ({ navigation, route }) => {
    const { title, description, icon } = route.params || {
        title: 'Sign In Required',
        description: 'Please sign in to access this feature and manage your account.',
        icon: 'lock-closed-outline'
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon} size={moderateScale(60)} color={PRIMARY} />
                </View>
                
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>

                <TouchableOpacity 
                    style={styles.loginBtn}
                    onPress={() => navigation.navigate('AuthChoice', { initialState: 'login' })}
                >
                    <Text style={styles.loginBtnText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.signupBtn}
                    onPress={() => navigation.navigate('AuthChoice', { initialState: 'signup' })}
                >
                    <Text style={styles.signupBtnText}>Create regular Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(40),
    },
    iconCircle: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    description: {
        fontSize: moderateScale(16),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: verticalScale(24),
        marginBottom: verticalScale(40),
    },
    loginBtn: {
        backgroundColor: PRIMARY,
        width: '100%',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    loginBtnText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    signupBtn: {
        backgroundColor: '#fff',
        width: '100%',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(15),
        alignItems: 'center',
        borderWidth: 2,
        borderColor: PRIMARY,
    },
    signupBtnText: {
        color: PRIMARY,
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
});

export default GuestPlaceholderScreen;
