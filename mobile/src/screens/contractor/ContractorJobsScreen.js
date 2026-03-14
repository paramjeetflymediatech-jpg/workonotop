import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { moderateScale, verticalScale, SCREEN_WIDTH } from '../../utils/responsive';

const ContractorJobsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState({ available: [], myJobs: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('available');

    const fetchJobs = async () => {
        try {
            const [availableRes, myJobsRes] = await Promise.all([
                api.get('/api/provider/available-jobs'),
                api.get('/api/provider/my-jobs'),
            ]);
            setJobs({
                available: availableRes.data || [],
                myJobs: myJobsRes.data || [],
            });
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchJobs(); };

    const acceptJob = async (jobId) => {
        Alert.alert('Accept Job?', 'Are you sure you want to accept this job?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Accept', onPress: async () => {
                    try {
                        await api.post('/api/booking/accept', { booking_id: jobId });
                        Alert.alert('Success', 'Job accepted! Check your schedule.');
                        fetchJobs();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to accept job. It may have been taken.');
                    }
                }
            },
        ]);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'in_progress': return { bg: '#f3e8ff', text: '#9333ea' };
            case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const displayJobs = activeTab === 'available' ? jobs.available : jobs.myJobs;

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Menu */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
                    <Ionicons name="menu" size={28} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Management</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {['available', 'myJobs'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === 'available' ? `Available (${jobs.available.length})` : `My Jobs (${jobs.myJobs.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#14b8a6" />}
            >
                {displayJobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>{activeTab === 'available' ? '🔍' : '📋'}</Text>
                        <Text style={styles.emptyTitle}>{activeTab === 'available' ? 'No Available Jobs' : 'No Jobs Yet'}</Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'available'
                                ? 'No jobs match your skills right now. Pull down to refresh.'
                                : 'You have not accepted any jobs yet.'}
                        </Text>
                    </View>
                ) : (
                    displayJobs.map((job) => {
                        const statusStyle = getStatusStyle(job.status);
                        const jobDate = job.job_date ? new Date(job.job_date).toLocaleDateString() : 'TBD';
                        const amount = parseFloat(job.provider_amount || job.service_price || 0);

                        return (
                            <TouchableOpacity
                                key={job.id}
                                style={styles.jobCard}
                                onPress={() => navigation.navigate('JobDetails', { job })}
                            >
                                <View style={styles.jobHeader}>
                                    <Text style={styles.jobService}>{job.service_name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                            {job.status?.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.jobMeta}>
                                    <Text style={styles.metaItem}>📅 {jobDate}</Text>
                                    <Text style={styles.metaItem}>💰 ${amount.toFixed(2)}</Text>
                                </View>
                                {job.customer_first_name && (
                                    <Text style={styles.customerName}>
                                        👤 {job.customer_first_name} {job.customer_last_name}
                                    </Text>
                                )}
                                {activeTab === 'available' && (
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() => acceptJob(job.id)}
                                    >
                                        <Text style={styles.acceptBtnText}>✓ Accept Job</Text>
                                    </TouchableOpacity>
                                )}
                                {activeTab === 'myJobs' && job.status === 'confirmed' && (
                                    <TouchableOpacity
                                        style={styles.startBtn}
                                        onPress={() => navigation.navigate('StartJob', { job })}
                                    >
                                        <Text style={styles.startBtnText}>▶ Start Job</Text>
                                    </TouchableOpacity>
                                )}
                                {activeTab === 'myJobs' && job.status === 'in_progress' && (
                                    <TouchableOpacity
                                        style={[styles.startBtn, { backgroundColor: '#f59e0b' }]}
                                        onPress={() => navigation.navigate('FinishJob', { job })}
                                    >
                                        <Text style={styles.startBtnText}>✔ Finish Job</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuBtn: {
        padding: moderateScale(4),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    tab: { flex: 1, padding: moderateScale(16), alignItems: 'center' },
    tabActive: { borderBottomWidth: 3, borderBottomColor: '#14b8a6' },
    tabText: { fontSize: moderateScale(14), fontWeight: '600', color: '#94a3b8' },
    tabTextActive: { color: '#14b8a6' },
    scroll: { padding: moderateScale(16), paddingBottom: 30 },
    emptyContainer: { alignItems: 'center', paddingVertical: verticalScale(60) },
    emptyIcon: { fontSize: moderateScale(56), marginBottom: verticalScale(16) },
    emptyTitle: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#0f172a', marginBottom: verticalScale(8) },
    emptyText: { fontSize: moderateScale(14), color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
    jobCard: {
        backgroundColor: '#fff', borderRadius: moderateScale(16),
        padding: moderateScale(16), marginBottom: verticalScale(12),
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4,
    },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(8) },
    jobService: { fontSize: moderateScale(17), fontWeight: 'bold', color: '#0f172a', flex: 1 },
    statusBadge: { paddingHorizontal: moderateScale(10), paddingVertical: verticalScale(4), borderRadius: moderateScale(20) },
    statusText: { fontSize: moderateScale(11), fontWeight: '700', textTransform: 'capitalize' },
    jobMeta: { flexDirection: 'row', gap: 16, marginBottom: verticalScale(6) },
    metaItem: { fontSize: moderateScale(13), color: '#64748b' },
    customerName: { fontSize: moderateScale(13), color: '#64748b', marginBottom: verticalScale(10) },
    acceptBtn: {
        backgroundColor: '#14b8a6', padding: moderateScale(12),
        borderRadius: moderateScale(12), alignItems: 'center', marginTop: verticalScale(8),
    },
    acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(14) },
    startBtn: {
        backgroundColor: '#10b981', padding: moderateScale(12),
        borderRadius: moderateScale(12), alignItems: 'center', marginTop: verticalScale(8),
    },
    startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(14) },
});

export default ContractorJobsScreen;
