'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from '../../../layout';

const DOC_TYPES = {
  profile_photo: { label: 'Profile Photo', icon: '👤', description: 'Clear, professional photo' },
  id_proof: { label: 'Government ID', icon: '🆔', description: "Driver's license or passport" },
  insurance: { label: 'Insurance Document', icon: '📄', description: 'Liability insurance certificate' },
  trade_license: { label: 'Trade License', icon: '📜', description: 'If applicable for your trade' },
};

function ModalShell({ isOpen, onClose, isDarkMode, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        {children}
      </div>
    </div>
  );
}

function ApproveModal({ isOpen, onClose, onConfirm, providerName, isDarkMode }) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode}>
      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className={`text-lg font-bold text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Approve Provider</h3>
      <p className={`text-sm text-center mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        Approve <strong>{providerName}</strong>? They&apos;ll receive a welcome email and can start accepting jobs immediately.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition">
          Approve & Notify
        </button>
      </div>
    </ModalShell>
  );
}

function RejectDocsModal({ isOpen, onClose, onConfirm, providerName, isDarkMode }) {
  const [reason, setReason] = useState('');
  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode}>
      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <h3 className={`text-lg font-bold text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reject Documents</h3>
      <p className={`text-sm text-center mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        Tell <strong>{providerName}</strong> what to fix — they&apos;ll be asked to re-upload.
      </p>
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-medium ${isDarkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Provider account stays — only documents need re-uploading
      </div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="e.g. Your insurance document appears expired. Please upload a valid certificate dated within the last year."
        rows={4}
        autoFocus
        className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
      />
      <p className={`text-xs mt-1.5 mb-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>This message is shown to the provider when they log in.</p>
      <div className="flex gap-3">
        <button onClick={() => { setReason(''); onClose(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!reason.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Reject & Notify
        </button>
      </div>
    </ModalShell>
  );
}

function RejectProviderModal({ isOpen, onClose, onConfirm, providerName, isDarkMode }) {
  const [reason, setReason] = useState('');
  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode}>
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className={`text-lg font-bold text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reject Provider Account</h3>
      <p className={`text-sm text-center mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
        Permanently reject <strong>{providerName}</strong>&apos;s application.
      </p>
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        This will suspend the provider&apos;s account and send a rejection email
      </div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="e.g. We could not verify your identity. The government ID provided does not match your profile information."
        rows={4}
        autoFocus
        className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
      />
      <p className={`text-xs mt-1.5 mb-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>This reason will be included in the rejection email sent to the provider.</p>
      <div className="flex gap-3">
        <button onClick={() => { setReason(''); onClose(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!reason.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Reject & Suspend
        </button>
      </div>
    </ModalShell>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const styles = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-amber-500', warning: 'bg-orange-500' };
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50">
      <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium ${styles[toast.type]}`}>
        <span className="flex-1">{toast.message}</span>
        <button onClick={onDismiss} className="opacity-70 hover:opacity-100 flex-shrink-0">✕</button>
      </div>
    </div>
  );
}

export default function ReviewDocuments({ params }) {
  const { providerId } = React.use(params);
  const router = useRouter();
  const { isDarkMode } = useAdminTheme();

  const [provider, setProvider] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { loadData(); }, [providerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/providers/${providerId}/documents`);
      const data = await res.json();
      if (data.success) {
        setProvider(data.provider);
        const map = new Map();
        data.documents.forEach(doc => {
          const existing = map.get(doc.document_type);
          if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
            map.set(doc.document_type, doc);
          }
        });
        setDocuments(Array.from(map.values()));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load provider data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const docsRes = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_all' }),
      });
      if (!docsRes.ok) { showToast('Failed to verify documents', 'error'); return; }

      const provRes = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'approve' }),
      });
      if (provRes.ok) {
        setProvider(prev => ({ ...prev, status: 'active' }));
        showToast('✅ Provider approved & documents verified! Welcome email sent.', 'success');
        setTimeout(() => router.push('/admin/providers'), 2000);
      } else {
        showToast('Failed to approve provider', 'error');
      }
    } catch { showToast('Failed to approve provider', 'error'); }
    finally { setProcessing(false); }
  };

  const handleRejectDocs = async (reason) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_all', rejectionReason: reason }),
      });
      if (res.ok) {
        setProvider(prev => ({ ...prev, status: 'inactive' }));
        showToast('Documents rejected — provider notified to re-upload.', 'info');
        setTimeout(() => router.push('/admin/providers'), 2000);
      } else {
        showToast('Failed to reject documents', 'error');
      }
    } catch { showToast('Failed to reject documents', 'error'); }
    finally { setProcessing(false); }
  };

  const handleRejectProvider = async (reason) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'reject', rejectionReason: reason }),
      });
      if (res.ok) {
        setProvider(prev => ({ ...prev, status: 'suspended' }));
        showToast('Provider account rejected & suspended.', 'warning');
        setTimeout(() => router.push('/admin/providers'), 2000);
      } else {
        showToast('Failed to reject provider', 'error');
      }
    } catch { showToast('Failed to reject provider', 'error'); }
    finally { setProcessing(false); }
  };

  const isApproved = provider?.status === 'active';
  const isSuspended = provider?.status === 'suspended' || provider?.status === 'rejected';
  const hasAllDocs = ['profile_photo', 'id_proof', 'insurance'].every(
    t => documents.some(d => d.document_type === t)
  );
  const allDocsAlreadyRejected = documents.length > 0 && documents.every(d => d.status === 'rejected');
  const hasPendingDocs = documents.some(d => d.status === 'pending');
  const canRejectDocs = !allDocsAlreadyRejected && hasPendingDocs;

  const card = `rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} shadow-sm`;
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtext = isDarkMode ? 'text-slate-400' : 'text-gray-500';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <ApproveModal isOpen={modal === 'approve'} onClose={() => setModal(null)} onConfirm={handleApprove} providerName={provider?.name} isDarkMode={isDarkMode} />
      <RejectDocsModal isOpen={modal === 'rejectDocs'} onClose={() => setModal(null)} onConfirm={handleRejectDocs} providerName={provider?.name} isDarkMode={isDarkMode} />
      <RejectProviderModal isOpen={modal === 'rejectProvider'} onClose={() => setModal(null)} onConfirm={handleRejectProvider} providerName={provider?.name} isDarkMode={isDarkMode} />

      {/* ── Sticky Header ── */}
      <div className={`sticky top-0 z-10 px-3 sm:px-6 py-3 sm:py-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-5xl mx-auto space-y-3">

          {/* Row 1: back + name */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className={`p-2 rounded-xl transition flex-shrink-0 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className={`text-base sm:text-lg font-bold truncate ${text}`}>{provider?.name}</h1>
              <p className={`text-xs hidden sm:block ${subtext}`}>Review documents before making a decision</p>
            </div>
          </div>

          {/* Row 2: action buttons / status badge */}
          {isApproved ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold ${isDarkMode ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
              ✓ Provider Approved
            </div>
          ) : isSuspended ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
              ✗ Provider Rejected
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setModal('approve')}
                disabled={processing || !hasAllDocs}
                title={!hasAllDocs ? 'Some required documents are missing' : ''}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${hasAllDocs
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>

              <button
                onClick={() => setModal('rejectDocs')}
                disabled={processing || !canRejectDocs}
                title={!canRejectDocs ? 'Documents already rejected — waiting for provider to re-upload' : ''}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${canRejectDocs
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {allDocsAlreadyRejected ? 'Already Rejected' : 'Reject Docs'}
              </button>

              <button
                onClick={() => setModal('rejectProvider')}
                disabled={processing}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Reject Provider
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Already-rejected banner ── */}
      {!isApproved && !isSuspended && allDocsAlreadyRejected && (
        <div className={`px-3 sm:px-6 py-2.5 border-b ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <div className="max-w-5xl mx-auto flex items-start gap-2">
            <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
              Documents already rejected — provider has been notified and must re-upload before you can take further action.
            </p>
          </div>
        </div>
      )}

      {/* ── Legend bar ── */}
      {!isApproved && !isSuspended && (
        <div className={`px-3 sm:px-6 py-2.5 border-b text-xs ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="max-w-5xl mx-auto flex items-start sm:items-center gap-2 sm:gap-6 flex-col sm:flex-row flex-wrap">
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" /> Approve — activate account
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block flex-shrink-0" /> Reject Docs — ask to re-upload
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block flex-shrink-0" /> Reject Provider — suspend permanently
            </span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* ── Provider Info ── */}
        <div className={card + ' p-4 sm:p-6'}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${subtext}`}>Provider Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {[
              ['Name', provider?.name],
              ['Email', provider?.email],
              ['Phone', provider?.phone],
              ['Specialty', provider?.specialty || '—'],
              ['Experience', `${provider?.experience_years || 0} yrs`],
              ['City', provider?.city || '—'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className={`text-xs mb-0.5 ${subtext}`}>{label}</p>
                <p className={`text-xs sm:text-sm font-medium break-words ${text}`}>{value}</p>
              </div>
            ))}
            {provider?.bio && (
              <div className="col-span-2 sm:col-span-3">
                <p className={`text-xs mb-0.5 ${subtext}`}>Bio</p>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{provider.bio}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center gap-2 flex-wrap"
            style={{ borderColor: isDarkMode ? '#334155' : '#f3f4f6' }}>
            <span className={`text-xs ${subtext}`}>Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${provider?.status === 'active'
                ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : provider?.status === 'suspended' || provider?.status === 'rejected'
                  ? isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                  : isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-amber-100 text-amber-800'
              }`}>
              {provider?.status?.toUpperCase()}
            </span>
            <span className={`sm:ml-auto text-xs ${subtext}`}>Stripe:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${provider?.stripe_onboarding_complete
                ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}>
              {provider?.stripe_onboarding_complete ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* ── Documents ── */}
        <div>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>
            Submitted Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className={card + ' p-8 sm:p-12 text-center'}>
              <p className={`text-sm ${subtext}`}>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {documents.map(doc => {
                const meta = DOC_TYPES[doc.document_type] || { label: doc.document_type, icon: '📎', description: '' };
                const isPdf = doc.document_url?.toLowerCase().endsWith('.pdf');
                const docSt = doc.status || 'pending';
                const docBorder = docSt === 'approved'
                  ? isDarkMode ? 'border-green-700' : 'border-green-200'
                  : docSt === 'rejected'
                    ? isDarkMode ? 'border-red-700' : 'border-red-200'
                    : isDarkMode ? 'border-slate-700' : 'border-gray-100';

                const statusBadge = docSt === 'approved'
                  ? { cls: isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-200', label: '✓ Approved' }
                  : docSt === 'rejected'
                    ? { cls: isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200', label: '✗ Rejected' }
                    : { cls: isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200', label: '⏳ Pending' };

                return (
                  <div key={doc.id} className={`rounded-xl border-2 ${docBorder} overflow-hidden shadow-sm`}>
                    <div className={`px-3 sm:px-5 py-3 border-b flex items-center justify-between gap-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg sm:text-xl flex-shrink-0">{meta.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold truncate ${text}`}>{meta.label}</p>
                          <p className={`text-xs hidden sm:block truncate ${subtext}`}>{meta.description}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${statusBadge.cls}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                        {isPdf ? (
                          <div className="p-4 sm:p-6 text-center">
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Open PDF
                            </a>
                          </div>
                        ) : (
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={doc.document_url}
                              alt={meta.label}
                              className="w-full h-36 sm:h-44 object-contain hover:opacity-90 transition"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-2 ${subtext}`}>
                        Uploaded {new Date(doc.created_at).toLocaleString()}
                      </p>

                      {docSt === 'rejected' && doc.rejection_reason && (
                        <div className={`mt-3 rounded-xl px-3 py-2.5 border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                          <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                            Rejection reason sent to provider:
                          </p>
                          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                            {doc.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom CTA bar ── */}
        {!isApproved && !isSuspended && documents.length > 0 && (
          <div className={`${card} p-3 sm:p-4`}>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:flex-wrap">
              <p className={`text-xs sm:text-sm ${subtext}`}>
                {allDocsAlreadyRejected
                  ? '🔴 Documents rejected — waiting for provider to re-upload.'
                  : hasAllDocs
                    ? '✅ All required documents present.'
                    : '⚠️ Some required documents are missing.'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setModal('approve')}
                  disabled={processing || !hasAllDocs}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${hasAllDocs
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >✓ Approve</button>
                <button
                  onClick={() => setModal('rejectDocs')}
                  disabled={processing || !canRejectDocs}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${canRejectDocs
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >{allDocsAlreadyRejected ? '⚠ Already Rejected' : '↑ Reject Docs'}</button>
                <button
                  onClick={() => setModal('rejectProvider')}
                  disabled={processing}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                >✗ Reject Provider</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}