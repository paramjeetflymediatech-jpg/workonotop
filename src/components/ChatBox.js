'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw } from 'lucide-react';

export default function ChatBox({ bookingId, currentUserType }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?bookingId=${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          message: newMessage,
          senderType: currentUserType
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Load messages once when component mounts
  useEffect(() => {
    fetchMessages();
  }, [bookingId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Refresh button */}
      <div className="flex justify-end p-2 border-b">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // compare types in lowercase and handle undefined
            const isMine = msg.sender_type?.toLowerCase() === currentUserType?.toLowerCase();
            return (
              <div key={msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-1">
                    {msg.sender_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {!isMine && <p className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">{msg.sender_name}</p>}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMine 
                      ? 'bg-green-500 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-green-100 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-gray-100 bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:opacity-40 transition active:scale-95"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}