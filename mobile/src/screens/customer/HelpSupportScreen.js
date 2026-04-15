import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const HelpSupportScreen = ({ navigation }) => {
    const supportOptions = [
        {
            icon: 'mail-outline',
            title: 'Email Support',
            subtitle: 'Get help within 24 hours',
            onPress: () => Linking.openURL('mailto:support@workonotop.com'),
            color: '#0ea5e9'
        },
        {
            icon: 'call-outline',
            title: 'Call Us',
            subtitle: 'Mon-Fri, 9am - 5pm',
            onPress: () => Linking.openURL('tel:+1234567890'),
            color: '#10b981'
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Live Chat',
            subtitle: 'Average wait time: 2 mins',
            onPress: () => alert('Chat service coming soon'),
            color: '#f59e0b'
        }
    ];

    const faqs = [
        {
            question: 'How do I book a service?',
            answer: 'You can book a service by navigating to the home screen, selecting a category, and following the booking steps.'
        },
        {
            question: 'Can I cancel my booking?',
            answer: 'Yes, you can cancel your booking from the "My Bookings" section up to 24 hours before the service starts.'
        },
        {
            question: 'How do I pay for services?',
            answer: 'Payments can be made securely using your credit/debit card or other available payment methods during the booking process.'
        }
    ];

    const FAQItem = ({ question, answer }) => (
        <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{question}</Text>
            <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.illustrationCircle}>
                        <Ionicons name="help-buoy" size={moderateScale(60)} color="#14b8a6" />
                    </View>
                    <Text style={styles.supportIntro}>How can we help you today?</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {supportOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.optionCard}
                            onPress={option.onPress}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                                <Ionicons name={option.icon} size={moderateScale(24)} color={option.color} />
                            </View>
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <View style={styles.faqContainer}>
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </View>

                <View style={{ height: verticalScale(20) }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: scale(20) },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: verticalScale(30),
    },
    illustrationCircle: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    supportIntro: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#0f172a',
    },
    optionsContainer: {
        marginBottom: verticalScale(30),
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: scale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    optionIcon: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#0f172a',
    },
    optionSubtitle: {
        fontSize: moderateScale(13),
        color: '#64748b',
        marginTop: verticalScale(2),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: verticalScale(16),
    },
    faqContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: scale(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    faqItem: {
        marginBottom: verticalScale(20),
    },
    faqQuestion: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: verticalScale(4),
    },
    faqAnswer: {
        fontSize: moderateScale(13),
        color: '#64748b',
        lineHeight: moderateScale(18),
    },
});

export default HelpSupportScreen;
