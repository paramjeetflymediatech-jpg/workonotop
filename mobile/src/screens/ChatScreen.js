import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import Typography from '../theme/Typography';


const TEAL = '#0f766e';
const TEAL_DARK = '#134e4a';
const TEAL_LIGHT = '#14b8a6';
const POLL_INTERVAL = 5000;

const ChatScreen = ({ navigation, route }) => {
    const { bookingId, bookingNumber, role, otherPartyName } = route.params || {};
    const { user, token } = useAuth();
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
            const res = await apiService.chat.getMessages(bookingId, token);
            if (res?.success) {
                setMessages(res.messages || []);
            }
        } catch (err) {
            console.error('Chat fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [bookingId, token]);

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
            await apiService.chat.sendMessage({ bookingId, message: msg, senderType: myType }, token);
            await fetchMessages();
        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setSending(false);
        }
    };

    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const renderMessage = ({ item, index }) => {
        // Synchronized with web logic (isMine based on sender_type)
        const isMine = item.sender_type?.toLowerCase() === myType?.toLowerCase();
        const prevItem = index > 0 ? messages[index - 1] : null;
        const showName = !isMine && (!prevItem || prevItem.sender_type !== item.sender_type);

        return (
            <View style={[styles.msgWrapper, isMine && styles.msgWrapperMine]}>
                {showName && (
                    <Text style={[styles.senderName, isMine ? { alignSelf: 'flex-end', marginRight: moderateScale(14) } : { alignSelf: 'flex-start', marginLeft: moderateScale(14) }]}>{item.sender_name}</Text>
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
            <View style={[styles.header, { 
                paddingTop: Platform.OS === 'android' 
                    ? StatusBar.currentHeight + verticalScale(10) 
                    : Math.max(insets.top, verticalScale(10)) 
            }]}>
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? verticalScale(40) : 0}
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
                <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + verticalScale(8) : verticalScale(12) }]}>
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
    loadingText: { marginTop: verticalScale(10), color: '#64748b', fontSize: Typography.body },

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
    headerTitle: { fontSize: Typography.bodyLarge, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: Typography.tiny, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

    msgList: { padding: scale(14), paddingBottom: verticalScale(10) },

    msgWrapper: { 
        marginBottom: verticalScale(6), 
        maxWidth: '85%', 
        alignSelf: 'flex-start',
        position: 'relative',
    },
    msgWrapperMine: { 
        alignSelf: 'flex-end',
    },

    senderName: { 
        fontSize: Typography.tiny, 
        color: '#94a3b8', 
        fontWeight: '600', 
        marginBottom: 3, 
    },

    bubble: {
        backgroundColor: '#fff', 
        borderRadius: moderateScale(18), 
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(10),
        elevation: 1, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3,
    },
    bubbleMine: {
        backgroundColor: '#22c55e', 
        borderBottomLeftRadius: moderateScale(18), 
        borderBottomRightRadius: moderateScale(4),
    },
    bubbleOther: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: moderateScale(4),
        borderBottomRightRadius: moderateScale(18),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    bubbleText: { 
        fontSize: Typography.body, 
        color: '#1e293b', 
        lineHeight: Typography.getLineHeight(Typography.body) 
    },
    bubbleTextMine: { 
        color: '#fff' 
    },
    timeText: { 
        fontSize: Typography.tiny, 
        color: '#94a3b8', 
        marginTop: 4, 
        textAlign: 'right',
    },
    timeTextMine: { 
        color: 'rgba(255,255,255,0.7)' 
    },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: scale(10),
        paddingHorizontal: scale(12), paddingTop: scale(12), paddingBottom: scale(12),
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#e2e8f0',
    },
    input: {
        flex: 1, backgroundColor: '#f8fafc', borderRadius: moderateScale(22),
        borderWidth: 1, borderColor: '#e2e8f0',
        paddingHorizontal: scale(16), paddingVertical: verticalScale(10),
        fontSize: Typography.body, color: '#1e293b', maxHeight: verticalScale(100),
    },
    sendBtn: {
        width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
        backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#94a3b8' },

    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: verticalScale(80) },
    emptyText: { fontSize: Typography.h5, fontWeight: '700', color: '#334155', marginTop: verticalScale(14) },
    emptySubText: { fontSize: Typography.bodySmall, color: '#94a3b8', marginTop: 6 },
});

export default ChatScreen;
