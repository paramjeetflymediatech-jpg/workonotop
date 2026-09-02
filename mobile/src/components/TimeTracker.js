import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

const TimeTracker = ({
    bookingId,
    onStart,
    onComplete,
    standardDuration = 60,
    overtimeRate = 0,
    hasBeforePhotos = false,
    hasAfterPhotos = false
}) => {
    const [timerStatus, setTimerStatus] = useState('not_started');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Start Form states
    const [showStartModal, setShowStartModal] = useState(false);
    const [workerCount, setWorkerCount] = useState(1);
    const [estimatedHours, setEstimatedHours] = useState('1');

    // Completion Form states
    const [workSummary, setWorkSummary] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [jobData, setJobData] = useState(null);
    
    const [submittedHours, setSubmittedHours] = useState('');
    const [submittedHeadcount, setSubmittedHeadcount] = useState(1);
    const [adjustmentReason, setAdjustmentReason] = useState('');

    const loadTimerStatus = useCallback(async () => {
        try {
            const res = await api.get(`/api/provider/jobs/time-tracking?booking_id=${bookingId}`);
            if (res.success) {
                setJobData(res.data);
                const status = res.data.job_timer_status || 'not_started';
                setTimerStatus(status);
                
                if (status === 'running' || status === 'paused') {
                    const accumulatedSeconds = res.data.accumulated_seconds || 0;
                    setElapsedTime(accumulatedSeconds);
                    
                    if (status === 'running') {
                        // Shift startTime backwards by the accumulated seconds so the interval calculates correctly
                        const shiftedStartTime = new Date(Date.now() - (accumulatedSeconds * 1000)).toISOString();
                        setStartTime(shiftedStartTime);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load timer:', err);
        }
    }, [bookingId]);

    useEffect(() => {
        loadTimerStatus();
    }, [loadTimerStatus]);

    useEffect(() => {
        let interval;
        if (timerStatus === 'running' && startTime) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerStatus, startTime]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleAction = async (action) => {

        if (action === 'stop') {
            if (!hasAfterPhotos) {
                Alert.alert('Required', 'Please upload after-work photos before completing the job.');
                return;
            }
            setSubmittedHours((elapsedTime / 3600).toFixed(2));
            setSubmittedHeadcount(jobData?.worker_count || (workerCount === '5+' ? 5 : workerCount));
            setShowCompleteModal(true);
            return;
        }

        if (action === 'start') {
            setShowStartModal(true);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/provider/jobs/time-tracking', {
                booking_id: bookingId,
                action
            });

            if (res.success) {
                if (action === 'start') {
                    setTimerStatus('running');
                    setStartTime(new Date().toISOString());
                    setElapsedTime(0);
                    if (onStart) onStart();
                } else if (action === 'pause') {
                    setTimerStatus('paused');
                } else if (action === 'resume') {
                    setTimerStatus('running');
                    const adjustedStart = new Date(Date.now() - elapsedTime * 1000).toISOString();
                    setStartTime(adjustedStart);
                }
            }
        } catch (err) {
            Alert.alert('Error', 'Action failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmStart = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/provider/jobs/time-tracking', {
                booking_id: bookingId,
                action: 'start',
                worker_count: workerCount === '5+' ? 5 : workerCount,
                estimated_hours: parseFloat(estimatedHours) || 1
            });

            if (res.success) {
                setTimerStatus('running');
                setShowStartModal(false);
                setStartTime(new Date().toISOString());
                setElapsedTime(0);
                if (onStart) onStart();
            }
        } catch (err) {
            Alert.alert('Error', 'Action failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSubmit = async () => {
        if (!workSummary.trim()) {
            Alert.alert('Required', 'Work summary is required to complete the job.');
            return;
        }

        const originalHours = (elapsedTime / 3600).toFixed(2);
        const originalHeadcount = jobData?.worker_count || (workerCount === '5+' ? 5 : workerCount);
        const isEdited = parseFloat(submittedHours) !== parseFloat(originalHours) || parseInt(submittedHeadcount) !== parseInt(originalHeadcount);
        
        if (isEdited && !adjustmentReason.trim()) {
            Alert.alert('Required', 'Reason for adjustment is required since you changed hours or headcount.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/provider/jobs/time-tracking', {
                booking_id: bookingId,
                action: 'stop',
                work_summary: workSummary.trim(),
                recommendations: recommendations.trim(),
                submitted_duration_minutes: Math.round(parseFloat(submittedHours) * 60),
                submitted_headcount: parseInt(submittedHeadcount),
                adjustment_reason: isEdited ? adjustmentReason.trim() : null
            });

            if (res.success) {
                setTimerStatus('completed');
                setShowCompleteModal(false);
                if (onComplete) onComplete(res.data);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to submit job report.');
        } finally {
            setLoading(false);
        }
    };

    const isOvertime = Math.floor(elapsedTime / 60) > standardDuration;

    if (timerStatus === 'completed' || (jobData && jobData.status === 'completed')) {
        const fmtDt = (dt) => {
            if (!dt) return '—';
            return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        };
        const actMins = jobData?.actual_duration_minutes || 0;
        const durStr = actMins >= 60 ? `${Math.floor(actMins/60)}h ${actMins%60}m` : `${actMins}m`;

        return (
            <View style={styles.completedBox}>
                <Ionicons name="checkmark-circle" size={48} color='#15843E' />
                <Text style={styles.completedTitle}>Job Finished</Text>
                <Text style={styles.completedText}>
                    {jobData?.status === 'completed' ? 'This job is fully completed.' : 'Awaiting customer approval.'}
                </Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Started</Text>
                        <Text style={styles.statValue}>{fmtDt(jobData?.start_time)}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Finished</Text>
                        <Text style={styles.statValue}>{fmtDt(jobData?.end_time)}</Text>
                    </View>
                    <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.statLabel}>Total Time</Text>
                        <Text style={[styles.statValue, { color: '#15843E', fontWeight: '800' }]}>{durStr}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.timerCircle, isOvertime && styles.timerOvertime]}>
                <Text style={[styles.timerValue, isOvertime && styles.timerValueOvertime]}>{formatTime(elapsedTime)}</Text>
                <Text style={styles.timerLabel}>{timerStatus === 'running' ? 'RECORDING' : timerStatus === 'paused' ? 'PAUSED' : 'READY'}</Text>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Standard</Text>
                    <Text style={styles.infoVal}>{standardDuration}m</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoVal}>Provider</Text>
                </View>
            </View>

            <View style={styles.actions}>
                {timerStatus === 'not_started' && !hasBeforePhotos && (
                    <View style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d', borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 15 }}>
                        <Text style={{ color: '#d97706', textAlign: 'center', fontSize: 12, fontWeight: '600' }}>⚠️ Before photos not uploaded</Text>
                    </View>
                )}
                {timerStatus === 'not_started' && (
                    <TouchableOpacity
                        style={[styles.btn, styles.startBtn]}
                        onPress={() => handleAction('start')}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="play" size={20} color="#fff" /><Text style={styles.btnText}>Start Job</Text></>}
                    </TouchableOpacity>
                )}

                {timerStatus === 'running' && (
                    <View style={styles.runningActions}>
                        <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={() => handleAction('pause')} disabled={loading}>
                            <Ionicons name="pause" size={20} color="#fff" />
                            <Text style={styles.btnText}>Pause / End Shift</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={() => handleAction('stop')} disabled={loading}>
                            <Ionicons name="checkmark-done" size={20} color="#fff" />
                            <Text style={styles.btnText}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {timerStatus === 'paused' && (
                    <View style={styles.runningActions}>
                        <TouchableOpacity style={[styles.btn, styles.resumeBtn]} onPress={() => handleAction('resume')} disabled={loading}>
                            <Ionicons name="play" size={20} color="#fff" />
                            <Text style={styles.btnText}>Resume</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={() => handleAction('stop')} disabled={loading}>
                            <Ionicons name="checkmark-done" size={20} color="#fff" />
                            <Text style={styles.btnText}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Start Form Modal */}
            <Modal visible={showStartModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalTitle}>Start Job</Text>
                            
                            <Text style={styles.modalLabel}>How many people are on site?</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                                {[1, 2, 3, 4, '5+'].map(num => (
                                    <TouchableOpacity 
                                        key={num} 
                                        style={[{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' }, workerCount === num && { backgroundColor: '#10b981' }]}
                                        onPress={() => setWorkerCount(num)}
                                    >
                                        <Text style={[{ color: '#475569', fontWeight: 'bold' }, workerCount === num && { color: '#fff' }]}>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.modalLabel}>Estimated hours</Text>
                            <TextInput
                                style={styles.textArea}
                                keyboardType="numeric"
                                placeholder="e.g. 2.5"
                                value={estimatedHours}
                                onChangeText={setEstimatedHours}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.btn, styles.cancelBtn]} 
                                    onPress={() => setShowStartModal(false)}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btn, styles.submitBtn]} 
                                    onPress={handleConfirmStart}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Start Job</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Completion Form Modal */}
            <Modal visible={showCompleteModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalTitle}>Complete Job</Text>
                            
                            <View style={{ backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <Text style={[styles.modalLabel, { marginTop: 0 }]}>Hours worked</Text>
                                <TextInput
                                    style={[styles.textArea, { height: 45, paddingVertical: 10, marginBottom: 10 }]}
                                    keyboardType="numeric"
                                    value={String(submittedHours)}
                                    onChangeText={setSubmittedHours}
                                />
                                
                                <Text style={styles.modalLabel}>People on job</Text>
                                <TextInput
                                    style={[styles.textArea, { height: 45, paddingVertical: 10, marginBottom: 10 }]}
                                    keyboardType="numeric"
                                    value={String(submittedHeadcount)}
                                    onChangeText={setSubmittedHeadcount}
                                />
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontWeight: '600', color: '#475569' }}>Total billable:</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#10b981' }}>{((parseFloat(submittedHours) || 0) * (parseInt(submittedHeadcount) || 1)).toFixed(2)} hrs</Text>
                                </View>
                            </View>

                            {(parseFloat(submittedHours) !== parseFloat((elapsedTime / 3600).toFixed(2)) || parseInt(submittedHeadcount) !== parseInt(jobData?.worker_count || (workerCount === '5+' ? 5 : workerCount))) && (
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={styles.modalLabel}>Why the change? <Text style={{ color: '#ef4444' }}>*</Text></Text>
                                    <TextInput
                                        style={[styles.textArea, { height: 80, borderColor: '#fca5a5' }]}
                                        multiline
                                        placeholder="Required since you changed the hours or headcount..."
                                        value={adjustmentReason}
                                        onChangeText={setAdjustmentReason}
                                    />
                                </View>
                            )}

                            <Text style={styles.modalLabel}>Work Summary *</Text>
                            <TextInput
                                style={styles.textArea}
                                multiline
                                placeholder="Describe exactly what was done..."
                                value={workSummary}
                                onChangeText={setWorkSummary}
                                maxLength={1000}
                            />

                            <Text style={styles.modalLabel}>Recommendations (Optional)</Text>
                            <TextInput
                                style={[styles.textArea, { height: 80 }]}
                                multiline
                                placeholder="Any future work needed?"
                                value={recommendations}
                                onChangeText={setRecommendations}
                                maxLength={500}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCompleteModal(false)} disabled={loading}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.submitBtn, loading && styles.disabledBtn]} onPress={handleCompleteSubmit} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Job</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    timerCircle: { width: scale(160), height: scale(160), borderRadius: scale(80), borderWidth: 8, borderColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    timerOvertime: { borderColor: '#fef3c7' },
    timerValue: { fontSize: 36, fontWeight: 'bold', color: '#0f172a', fontVariant: ['tabular-nums'] },
    timerValueOvertime: { color: '#b45309' },
    timerLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', marginTop: 4, letterSpacing: 1.5 },
    infoRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9' },
    infoItem: { alignItems: 'center' },
    infoLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
    infoVal: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
    actions: { width: '100%' },
    btn: { height: verticalScale(50), borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    startBtn: { backgroundColor: '#10b981' },
    runningActions: { flexDirection: 'row', gap: 12 },
    pauseBtn: { flex: 1, backgroundColor: '#f59e0b' },
    resumeBtn: { flex: 1, backgroundColor: '#10b981' },
    stopBtn: { flex: 1, backgroundColor: '#1e293b' },
    disabledBtn: { backgroundColor: '#cbd5e1' },
    completedBox: { alignItems: 'center', padding: 24, backgroundColor: '#ecfdf5', borderRadius: 20, width: '100%', borderWidth: 1, borderColor: '#dcfce7' },
    completedTitle: { fontSize: 20, fontWeight: '800', color: '#15843E', marginTop: 12 },
    completedText: { fontSize: 14, color: '#15843E', marginTop: 4, fontWeight: '500', marginBottom: 20 },
    statsContainer: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: 14, color: '#1e293b', fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '80%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 20 },
    modalLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
    textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15, padding: 12, height: 120, fontSize: 15, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 20 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 15, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
    submitBtn: { flex: 1, height: 50, borderRadius: 15, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default TimeTracker;
