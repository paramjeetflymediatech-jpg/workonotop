import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, ActivityIndicator, StatusBar,
    TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';
const POLL_INTERVAL = 5000;

const ChatScreen = ({ navigation, route }) => {
    const { bookingId, bookingNumber, role, otherPartyName } = route.params || {};
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);
    const pollRef = useRef(null);

    const myType = role || (user?.role === 'provider' ? 'provider' : 'customer');

    const fetchMessages = useCallback(async () => {
        try {
            const res = await apiService.chat.getMessages(bookingId, user?.token);
            if (res?.success) {
                setMessages(res.messages || []);
            }
        } catch (err) {
            console.error('Chat fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [bookingId, user?.token]);

    useEffect(() => {
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [fetchMessages]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const sendMessage = async () => {
        const msg = text.trim();
        if (!msg || sending) return;
        setSending(true);
        setText('');
        try {
            await apiService.chat.sendMessage({ bookingId, message: msg }, user?.token);
            await fetchMessages();
        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setSending(false);
        }
    };

    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const renderMessage = ({ item, index }) => {
        const isMine = item.sender_type === myType;
        const prevItem = index > 0 ? messages[index - 1] : null;
        const showName = !isMine && (!prevItem || prevItem.sender_type !== item.sender_type);

        return (
            <View style={[styles.msgWrapper, isMine && styles.msgWrapperMine]}>
                {showName && (
                    <Text style={styles.senderName}>{item.sender_name}</Text>
                )}
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.timeText, isMine && styles.timeTextMine]}>
                        {fmtTime(item.created_at)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(22)} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerMid}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {otherPartyName || 'Chat'}
                    </Text>
                    <Text style={styles.headerSub}>Booking #{bookingNumber || bookingId}</Text>
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={moderateScale(22)} color="rgba(255,255,255,0.7)" />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={TEAL} />
                        <Text style={styles.loadingText}>Loading chat...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.msgList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Ionicons name="chatbubbles-outline" size={moderateScale(52)} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No messages yet</Text>
                                <Text style={styles.emptySubText}>Start the conversation below</Text>
                            </View>
                        }
                    />
                )}

                {/* Input bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder="Type a message..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={!text.trim() || sending}
                    >
                        {sending
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="send" size={moderateScale(18)} color="#fff" />
                        }
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(10), color: '#64748b', fontSize: moderateScale(14) },

    header: {
        flexDirection: 'row', alignItems: 'center', gap: scale(12),
        backgroundColor: TEAL_DARK,
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(16),
    },
    backBtn: {
        width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    headerMid: { flex: 1 },
    headerTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: moderateScale(11), color: 'rgba(255,255,255,0.65)', marginTop: 1 },

    msgList: { padding: scale(14), paddingBottom: verticalScale(10) },

    msgWrapper: { marginBottom: verticalScale(6), maxWidth: '80%', alignSelf: 'flex-start' },
    msgWrapperMine: { alignSelf: 'flex-end' },

    senderName: { fontSize: moderateScale(11), color: '#94a3b8', fontWeight: '600', marginBottom: 3, marginLeft: 4 },

    bubble: {
        backgroundColor: '#fff', borderRadius: moderateScale(18), padding: moderateScale(12),
        borderBottomLeftRadius: moderateScale(4),
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
    },
    bubbleMine: {
        backgroundColor: TEAL, borderBottomLeftRadius: moderateScale(18), borderBottomRightRadius: moderateScale(4),
    },
    bubbleText: { fontSize: moderateScale(14), color: '#1e293b', lineHeight: moderateScale(20) },
    bubbleTextMine: { color: '#fff' },
    timeText: { fontSize: moderateScale(10), color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
    timeTextMine: { color: 'rgba(255,255,255,0.65)' },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: scale(10),
        padding: scale(12),
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#e2e8f0',
    },
    input: {
        flex: 1, backgroundColor: '#f8fafc', borderRadius: moderateScale(22),
        borderWidth: 1, borderColor: '#e2e8f0',
        paddingHorizontal: scale(16), paddingVertical: verticalScale(10),
        fontSize: moderateScale(14), color: '#1e293b', maxHeight: verticalScale(100),
    },
    sendBtn: {
        width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
        backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#94a3b8' },

    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: verticalScale(80) },
    emptyText: { fontSize: moderateScale(17), fontWeight: '700', color: '#334155', marginTop: verticalScale(14) },
    emptySubText: { fontSize: moderateScale(13), color: '#94a3b8', marginTop: 6 },
});

export default ChatScreen;
