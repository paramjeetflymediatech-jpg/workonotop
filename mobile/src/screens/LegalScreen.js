import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const LegalScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { type } = route.params || { type: 'terms' };

    const getContent = () => {
        switch (type) {
            case 'terms':
                return {
                    title: 'Terms of Service',
                    content: 'Welcome to WorkOnTap. By using our services, you agree to these terms.\n\n1. Acceptance of Terms\nYour access to and use of WorkOnTap is subject exclusively to these Terms and Conditions.\n\n2. User Account\nYou are responsible for maintaining the confidentiality of your account and password.\n\n3. Service Bookings\nAll bookings are subject to availability and acceptance by the service provider.'
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    content: 'Your privacy is important to us. This policy explains how we collect and use your data.\n\n1. Information Collection\nWe collect information when you register, book a service, or contact us.\n\n2. Data Usage\nWe use your data to provide services, improve user experience, and communicate with you.\n\n3. Data Protection\nWe implement standard security measures to protect your personal information.'
                };
            case 'about':
                return {
                    title: 'About Us',
                    content: 'WorkOnTap is your premier platform for home maintenance and professional services.\n\nOur mission is to connect homeowners with skilled, verified professionals instantly.\n\nVersion: 1.0.2\nBuild: 2026.03.21\n\n© 2026 WorkOnTap Inc.'
                };
            default:
                return { title: 'Information', content: '' };
        }
    };

    const data = getContent();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{data.title}</Text>
                <View style={{ width: moderateScale(40) }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.legalText}>{data.content}</Text>
                <View style={{ height: verticalScale(40) }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: { width: moderateScale(40), height: moderateScale(40), justifyContent: 'center' },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    content: { padding: moderateScale(20) },
    legalText: {
        fontSize: moderateScale(15),
        lineHeight: moderateScale(24),
        color: '#334155',
        textAlign: 'justify'
    }
});

export default LegalScreen;
