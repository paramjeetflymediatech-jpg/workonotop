import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { marginTop: Math.max(insets.top, verticalScale(10)) }]}>
                <Text style={styles.title}>WorkOnTop</Text>
                <Text style={styles.subtitle}>Stay on top of every job</Text>
            </View>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Services')}
                >
                    <Text style={styles.cardIcon}>🛠️</Text>
                    <Text style={styles.cardTitle}>Services</Text>
                    <Text style={styles.cardDesc}>Browse our trade offerings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.cardIcon}>👤</Text>
                    <Text style={styles.cardTitle}>My Profile</Text>
                    <Text style={styles.cardDesc}>Manage your account</Text>
                </TouchableOpacity>
            </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Quick Tips</Text>
                    <Text style={styles.infoText}>Check your services regularly to keep your pricing updated and attract more customers.</Text>
                </View>
                <View style={{ height: verticalScale(100) }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: moderateScale(32),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: moderateScale(16),
        color: '#64748b',
        marginTop: verticalScale(4),
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    cardDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    infoBox: {
        backgroundColor: '#e0f2f1',
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#14b8a6',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#115e59',
    },
    infoText: {
        fontSize: 14,
        color: '#134e4a',
        marginTop: 4,
        lineHeight: 20,
    },
});

export default HomeScreen;
