import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

const ProviderDashboard = ({ navigation }) => {
    const { user } = useAuth();

    const StatBox = ({ label, value, color }) => (
        <View style={[styles.statBox, { backgroundColor: color + '15' }]}>
            <Text style={[styles.statValue, { color: color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: color }]}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Pro Dashboard</Text>
                        <Text style={styles.nameText}>Hi, {user?.name || 'Partner'}</Text>
                    </View>
                    <View style={styles.statusToggle}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <StatBox label="Today's Earnings" value="$128.50" color="#10b981" />
                    <StatBox label="Weekly Rating" value="4.9" color="#f59e0b" />
                </View>

                <View style={styles.jobsCard}>
                    <Text style={styles.jobsTitle}>New Jobs Available</Text>
                    <Text style={styles.jobsSubtitle}>You have 5 jobs matching your skills nearby</Text>
                    <TouchableOpacity style={styles.viewJobsButton}>
                        <Text style={styles.viewJobsText}>View Available Jobs</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Upcoming Schedule</Text>

                {[1, 2].map((item) => (
                    <View key={item} style={styles.scheduleItem}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateDay}>MAR</Text>
                            <Text style={styles.dateNum}>07</Text>
                        </View>
                        <View style={styles.jobDetails}>
                            <Text style={styles.jobType}>Kitchen Pipe Leakage</Text>
                            <Text style={styles.jobTime}>09:00 AM - 11:00 AM</Text>
                            <Text style={styles.jobLocation}>📍 452 Park Ave, New York</Text>
                        </View>
                        <TouchableOpacity style={styles.detailsIcon}>
                            <Text style={{ fontSize: moderateScale(20) }}>➡️</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.toolsGrid}>
                    <TouchableOpacity style={styles.toolCard}>
                        <Text style={styles.toolIcon}>📊</Text>
                        <Text style={styles.toolTitle}>Earning History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolCard}>
                        <Text style={styles.toolIcon}>⭐</Text>
                        <Text style={styles.toolTitle}>My Reviews</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    welcomeText: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontWeight: '500',
    },
    nameText: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statusToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: '#bcf0da',
    },
    statusDot: {
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: '#10b981',
        marginRight: moderateScale(6),
    },
    statusText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: moderateScale(12),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    statBox: {
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
    },
    statValue: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: moderateScale(12),
        marginTop: verticalScale(4),
        fontWeight: '500',
    },
    jobsCard: {
        backgroundColor: '#1e293b',
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        marginBottom: verticalScale(30),
    },
    jobsTitle: {
        color: '#fff',
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    jobsSubtitle: {
        color: '#94a3b8',
        fontSize: moderateScale(14),
        marginTop: verticalScale(6),
        marginBottom: verticalScale(20),
    },
    viewJobsButton: {
        backgroundColor: '#14b8a6',
        padding: moderateScale(14),
        borderRadius: moderateScale(12),
        alignItems: 'center',
    },
    viewJobsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: moderateScale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(16),
    },
    scheduleItem: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dateBox: {
        backgroundColor: '#f1f5f9',
        padding: moderateScale(10),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        width: moderateScale(60),
    },
    dateDay: {
        fontSize: moderateScale(10),
        color: '#64748b',
        fontWeight: 'bold',
    },
    dateNum: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobDetails: {
        flex: 1,
        marginLeft: moderateScale(16),
    },
    jobType: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    jobTime: {
        fontSize: moderateScale(12),
        color: '#14b8a6',
        marginTop: verticalScale(2),
        fontWeight: '600',
    },
    jobLocation: {
        fontSize: moderateScale(12),
        color: '#64748b',
        marginTop: verticalScale(4),
    },
    toolsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(10),
    },
    toolCard: {
        backgroundColor: '#fff',
        width: (SCREEN_WIDTH - moderateScale(56)) / 2,
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toolIcon: {
        fontSize: moderateScale(28),
        marginBottom: verticalScale(10),
    },
    toolTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#475569',
    }
});

export default ProviderDashboard;
