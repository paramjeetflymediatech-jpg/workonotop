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
    
    // Completion Form states
    const [workSummary, setWorkSummary] = useState('');
    const [recommendations, setRecommendations] = useState('');

    const loadTimerStatus = useCallback(async () => {
        try {
            const res = await api.get(`/api/provider/jobs/time-tracking?booking_id=${bookingId}`);
            if (res.success) {
                const status = res.data.job_timer_status || 'not_started';
                setTimerStatus(status);
                if (res.data.start_time && status === 'running') {
                    setStartTime(res.data.start_time);
                    const elapsed = Math.floor((Date.now() - new Date(res.data.start_time).getTime()) / 1000);
                    setElapsedTime(elapsed);
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
        if (action === 'start' && !hasBeforePhotos) {
            Alert.alert('Required', 'Please upload before-work photos before starting the job.');
            return;
        }

        if (action === 'stop') {
            if (!hasAfterPhotos) {
                Alert.alert('Required', 'Please upload after-work photos before completing the job.');
                return;
            }
            setShowCompleteModal(true);
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

    const handleCompleteSubmit = async () => {
        if (!workSummary.trim()) {
            Alert.alert('Required', 'Work summary is required to complete the job.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/provider/jobs/time-tracking', {
                booking_id: bookingId,
                action: 'stop',
                work_summary: workSummary.trim(),
                recommendations: recommendations.trim()
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

    if (timerStatus === 'completed') {
        return (
            <View style={styles.completedBox}>
                <Ionicons name="checkmark-circle" size={40} color='#134e4a' />
                <Text style={styles.completedTitle}>Job Finished</Text>
                <Text style={styles.completedText}>Awaiting customer approval.</Text>
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
                {timerStatus === 'not_started' && (
                    <TouchableOpacity 
                        style={[styles.btn, styles.startBtn, !hasBeforePhotos && styles.disabledBtn]} 
                        onPress={() => handleAction('start')}
                        disabled={loading || !hasBeforePhotos}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="play" size={20} color="#fff" /><Text style={styles.btnText}>Start Job</Text></>}
                    </TouchableOpacity>
                )}

                {timerStatus === 'running' && (
                    <View style={styles.runningActions}>
                        <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={() => handleAction('pause')} disabled={loading}>
                            <Ionicons name="pause" size={20} color="#fff" />
                            <Text style={styles.btnText}>Pause</Text>
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

            {/* Completion Form Modal */}
            <Modal visible={showCompleteModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalTitle}>Complete Job</Text>
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
    completedBox: { alignItems: 'center', padding: 30, backgroundColor: '#ecfdf5', borderRadius: 20, width: '100%' },
    completedTitle: { fontSize: 18, fontWeight: 'bold', color: '#134e4a', marginTop: 12 },
    completedText: { fontSize: 14, color: '#134e4a', marginTop: 4 },
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
