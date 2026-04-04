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
                    content: 'Last updated: April 2026\n\nWelcome to WorkOnTap. These Terms of Service ("Terms") govern your use of the WorkOnTap platform, website, and mobile applications ("Services"). BY USING OUR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS.\n\n1. THE MARKETPLACE PLATFORM\nWorkOnTap is a digital marketplace platform that connects customers seeking home and professional services ("Customers") with independent service providers ("Pros"). WorkOnTap is a platform provider and does not provide professional services directly. Pros are independent contractors and are not employees of WorkOnTap.\n\n2. USER ACCOUNTS\nYou must be at least 18 years of age to use the Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\n3. BOOKING AND PAYMENTS\n- Estimates: All prices listed are initial estimates. Final costs may vary based on the actual duration and scope of work.\n- Payments: Payments are processed securely via our payment partners (Stripe). You authorize WorkOnTap to charge your payment method for the service fee plus applicable taxes.\n- Taxes: All prices are subject to applicable Canadian taxes (GST/HST/PST) based on the location of the service.\n\n4. CANCELLATION POLICY\nCancellations made more than 24 hours before the scheduled time are free. Cancellations within 24 hours of the scheduled time may incur a cancellation fee as specified at the time of booking.\n\n5. LIMITATION OF LIABILITY\nTo the maximum extent permitted by the laws of Canada and your Province of residence, WorkOnTap shall not be liable for any indirect, incidental, or consequential damages. WorkOnTap is not liable for the performance, qualities, or conduct of any Service Provider.\n\n6. GOVERNING LAW\nThese Terms are governed by the laws of Canada and the Province in which you reside. Disputes shall be resolved in the competent courts of Canada.\n\n7. CONTACT INFORMATION\nFor legal inquiries, contact us at: legal@workontap.ca\n\n© 2026 WorkOnTap Inc.'
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    content: 'Last updated: April 2026\n\nAt WorkOnTap, we are committed to protecting your personal information. As a Canadian platform, our practices comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial laws.\n\n1. INFORMATION WE COLLECT\nWe collect information necessary to provide our services, including:\n- Contact Details: Name, email, and phone number.\n- Service Address: Your physical location to facilitate on-site visits.\n- Professional Data: For Pros, we collect background info and identification for verification purposes.\n- Payment Info: Securely handled by Stripe; we do not store full credit card numbers.\n\n2. HOW WE USE YOUR INFORMATION\nWe use your data to:\n- Facilitate bookings between Customers and Pros.\n- Provide customer support and manage accounts.\n- Send transaction updates and security alerts.\n- Comply with legal obligations under Canadian law.\n\n3. DATA SHARING\nWe only share your data with Service Providers as necessary to fulfill your job request. We NEVER sell your personal information to third parties.\n\n4. YOUR PRIVACY RIGHTS\nUnder PIPEDA, you have the right to access your personal data, request corrections, or withdraw consent for certain data processing. You may delete your account by contacting our support team.\n\n5. DATA SECURITY\nWe use industry-standard encryption to protect your data. While data may occasionally be processed outside of Canada, we ensure our partners meet equivalent security standards.\n\n6. CONTACT US\nFor privacy questions, contact our Privacy Officer at: privacy@workontap.ca'
                };
            case 'about':
                return {
                    title: 'About Us',
                    content: 'WorkOnTap is Canada\'s premier on-demand marketplace connecting homeowners with skilled, verified service professionals. Founded with the mission to simplify home maintenance, we provide instant access to high-quality help across Canada, from Toronto and Ottawa to Vancouver and Calgary.\n\nAt WorkOnTap, we prioritize:\n- Quality & Trust: Every professional on our platform is vetted and reviewed by the community to ensure the highest standards.\n- Transparency: Fair, upfront pricing and clear communication for every job.\n- Support: Our dedicated Canadian support team is here to assist you every step of the way.\n\nWhether you need a quick repair or a major home improvement project, WorkOnTap is your partner for getting work done right.\n\n© 2026 WorkOnTap Inc.\nOperating in: Ontario, British Columbia, Alberta, and beyond.'
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
