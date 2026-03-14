import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '../utils/responsive';

const PlaceholderScreen = ({ navigation, route }) => {
    const { title } = route.params || { title: 'Coming Soon' };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {navigation.canGoBack() ? (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backButton}>
                        <Ionicons name="menu" size={28} color="#0f172a" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="construct-outline" size={80} color="#14b8a6" />
                </View>
                <Text style={styles.title}>{title} is coming soon!</Text>
                <Text style={styles.subtitle}>
                    We're working hard to bring this feature to you. Stay tuned for updates!
                </Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(40),
    },
    iconContainer: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: '#f0fdfa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    title: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: verticalScale(12),
    },
    subtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        textAlign: 'center',
        lineHeight: moderateScale(20),
        marginBottom: verticalScale(40),
    },
    button: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: moderateScale(30),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(16),
    },
});

export default PlaceholderScreen;
