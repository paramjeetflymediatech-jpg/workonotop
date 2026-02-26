










// // app/admin/providers/[providerId]/documents/page.jsx - FINAL VERSION
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAdminTheme } from '../../../layout';

// const DOC_TYPES = {
//   profile_photo: { 
//     label: 'Profile Photo', 
//     icon: '👤', 
//     required: true,
//     description: 'Clear, professional photo of yourself'
//   },
//   id_proof: { 
//     label: 'Government ID', 
//     icon: '🆔', 
//     required: true,
//     description: 'Driver\'s license, passport, or other government ID'
//   },
//   insurance: { 
//     label: 'Insurance Document', 
//     icon: '📄', 
//     required: true,
//     description: 'Liability insurance certificate'
//   },
//   trade_license: { 
//     label: 'Trade License', 
//     icon: '📜', 
//     required: false,
//     description: 'Optional - if applicable for your trade'
//   }
// };

// export default function ReviewDocuments({ params }) {
//   const { providerId } = React.use(params);
//   const router = useRouter();
//   const { isDarkMode } = useAdminTheme();
  
//   const [provider, setProvider] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [bankAccount, setBankAccount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [activeTab, setActiveTab] = useState('all');

//   useEffect(() => {
//     loadData();
//   }, [providerId]);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/admin/providers/${providerId}/documents`);
//       const data = await res.json();
      
//       if (data.success) {
//         setProvider(data.provider);
        
//         const docMap = new Map();
//         data.documents.forEach(doc => {
//           const existing = docMap.get(doc.document_type);
//           if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
//             docMap.set(doc.document_type, doc);
//           }
//         });
//         setDocuments(Array.from(docMap.values()));
//         setBankAccount(data.bankAccount);
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveDocument = async (docId) => {
//     if (!confirm('✅ Approve this document?')) return;
    
//     setProcessing(true);
//     try {
//       const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'approve_document', documentId: docId })
//       });
      
//       if (res.ok) {
//         alert('Document approved successfully!');
//         loadData();
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to approve document');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleRejectDocument = async (docId) => {
//     const reason = prompt('❌ Why are you rejecting this document? (Reason will be sent to provider)');
//     if (!reason) return;
    
//     setProcessing(true);
//     try {
//       const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           action: 'reject_document', 
//           documentId: docId,
//           rejectionReason: reason 
//         })
//       });
      
//       if (res.ok) {
//         alert('Document rejected! Reason saved.');
//         loadData();
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to reject document');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleApproveProvider = async () => {
//     const requiredDocs = ['profile_photo', 'id_proof', 'insurance'];
//     const approvedTypes = documents.filter(d => d.status === 'approved').map(d => d.document_type);
//     const missing = requiredDocs.filter(t => !approvedTypes.includes(t));
    
//     if (missing.length > 0) {
//       alert(`Please approve all required documents first: ${missing.join(', ')}`);
//       return;
//     }

//     if (!confirm('Approve this provider? They will be able to start working.')) return;

//     setProcessing(true);
//     try {
//       const res = await fetch('/api/admin/providers', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ providerId, action: 'approve' })
//       });
      
//       if (res.ok) {
//         alert('✅ Provider approved! Email sent.');
//         await loadData();
//         setTimeout(() => {
//           router.push('/admin/providers');
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to approve provider');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleRejectProvider = async () => {
//     const reason = prompt('❌ Why are you rejecting this provider?');
//     if (!reason) return;

//     setProcessing(true);
//     try {
//       const res = await fetch('/api/admin/providers', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ providerId, action: 'reject', rejectionReason: reason })
//       });
      
//       if (res.ok) {
//         alert('Provider rejected');
//         router.push('/admin/providers');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to reject provider');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       approved: isDarkMode 
//         ? 'bg-green-900/30 text-green-400 border-green-800' 
//         : 'bg-green-100 text-green-800 border-green-200',
//       pending: isDarkMode 
//         ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' 
//         : 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       rejected: isDarkMode 
//         ? 'bg-red-900/30 text-red-400 border-red-800' 
//         : 'bg-red-100 text-red-800 border-red-200'
//     };
//     const labels = {
//       approved: '✓ Approved',
//       pending: '⏳ Pending',
//       rejected: '✗ Rejected'
//     };
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
//         {labels[status] || status}
//       </span>
//     );
//   };

//   const filteredDocuments = activeTab === 'all' 
//     ? documents 
//     : documents.filter(d => d.status === activeTab);

//   const stats = {
//     total: documents.length,
//     pending: documents.filter(d => d.status === 'pending').length,
//     approved: documents.filter(d => d.status === 'approved').length,
//     rejected: documents.filter(d => d.status === 'rejected').length
//   };

//   const isProviderApproved = provider?.status === 'active';
//   const allRequiredApproved = ['profile_photo', 'id_proof', 'insurance'].every(
//     type => documents.some(d => d.document_type === type && d.status === 'approved')
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
//       {/* Header */}
//       <div className={`border-b sticky top-0 z-10 shadow-sm ${
//         isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//       }`}>
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => router.back()}
//                 className={`p-2 rounded-lg transition ${
//                   isDarkMode 
//                     ? 'hover:bg-slate-700 text-slate-300 hover:text-white' 
//                     : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//               </button>
//               <div>
//                 <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Review Provider Documents
//                 </h1>
//                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                   Review and verify all documents before approval
//                 </p>
//               </div>
//             </div>
            
//             {!isProviderApproved ? (
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleApproveProvider}
//                   disabled={processing || !allRequiredApproved}
//                   className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
//                     allRequiredApproved 
//                       ? 'bg-green-600 text-white hover:bg-green-700' 
//                       : isDarkMode 
//                         ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
//                         : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   Approve Provider
//                 </button>
//                 <button
//                   onClick={handleRejectProvider}
//                   disabled={processing}
//                   className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   Reject Provider
//                 </button>
//               </div>
//             ) : (
//               <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
//                 isDarkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
//               }`}>
//                 <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
//                   Provider Approved
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Provider Info Card */}
//         <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
//           isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//         }`}>
//           <div className="grid grid-cols-3 gap-6">
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Full Name</p>
//               <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider?.name}</p>
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
//               <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider?.email}</p>
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone</p>
//               <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider?.phone}</p>
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Specialty</p>
//               <p className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 {provider?.specialty || 'Not specified'}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Experience</p>
//               <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 {provider?.experience_years || 0} years
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>City</p>
//               <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 {provider?.city || 'Not specified'}
//               </p>
//             </div>
//             <div className="col-span-3">
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Bio</p>
//               <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
//                 {provider?.bio || 'No bio provided'}
//               </p>
//             </div>
//           </div>
          
//           <div className="mt-4 flex gap-2">
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//               provider?.status === 'active' 
//                 ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
//                 : provider?.status === 'rejected'
//                   ? isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
//                   : isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
//             }`}>
//               Status: {provider?.status?.toUpperCase()}
//             </span>
//           </div>
//         </div>

//         {/* Stripe Info Card */}
//         <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
//           isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//         }`}>
//           <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>
//             <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//             </svg>
//             Payment Setup
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Stripe Account</p>
//               {provider?.stripe_account_id ? (
//                 <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
//                   isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
//                 }`}>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   Connected
//                 </span>
//               ) : (
//                 <span className={`px-3 py-1 rounded-full text-sm ${
//                   isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800'
//                 }`}>Not Connected</span>
//               )}
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Onboarding Status</p>
//               {provider?.stripe_onboarding_complete ? (
//                 <span className={`px-3 py-1 rounded-full text-sm ${
//                   isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
//                 }`}>Complete</span>
//               ) : (
//                 <span className={`px-3 py-1 rounded-full text-sm ${
//                   isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
//                 }`}>Pending</span>
//               )}
//             </div>
//             <div>
//               <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Account Status</p>
//               <span className={`px-3 py-1 rounded-full text-sm ${
//                 bankAccount?.account_status === 'verified'
//                   ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
//                   : bankAccount?.account_status === 'pending'
//                     ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
//                     : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800'
//               }`}>
//                 {bankAccount?.account_status || 'N/A'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-4 gap-4 mb-6">
//           <div className={`rounded-xl shadow-sm border p-4 ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//           }`}>
//             <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Documents</p>
//             <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
//           </div>
//           <div className={`rounded-xl shadow-sm border p-4 ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//           }`}>
//             <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending</p>
//             <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className={`rounded-xl shadow-sm border p-4 ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//           }`}>
//             <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Approved</p>
//             <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
//           </div>
//           <div className={`rounded-xl shadow-sm border p-4 ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//           }`}>
//             <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rejected</p>
//             <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className={`border-b mb-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
//           <nav className="flex gap-4">
//             {['all', 'pending', 'approved', 'rejected'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
//                   activeTab === tab
//                     ? 'border-teal-600 text-teal-600'
//                     : isDarkMode
//                       ? 'border-transparent text-slate-400 hover:text-slate-300'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {tab} {tab !== 'all' && `(${stats[tab]})`}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Documents Grid */}
//         {filteredDocuments.length === 0 ? (
//           <div className={`rounded-xl shadow-sm border p-12 text-center ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//           }`}>
//             <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <p className={`mt-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//               No {activeTab} documents found
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredDocuments.map((doc) => (
//               <div key={doc.id} className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition ${
//                 isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
//               }`}>
//                 {/* Header */}
//                 <div className={`px-4 py-3 border-b flex items-center justify-between ${
//                   isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                   <div className="flex items-center gap-3">
//                     <span className="text-3xl">{DOC_TYPES[doc.document_type]?.icon}</span>
//                     <div>
//                       <h3 className={`font-medium flex items-center gap-2 ${
//                         isDarkMode ? 'text-white' : 'text-gray-900'
//                       }`}>
//                         {DOC_TYPES[doc.document_type]?.label}
//                         {DOC_TYPES[doc.document_type]?.required && (
//                           <span className="text-xs text-red-500 font-normal">*Required</span>
//                         )}
//                       </h3>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                         {DOC_TYPES[doc.document_type]?.description}
//                       </p>
//                     </div>
//                   </div>
//                   {getStatusBadge(doc.status)}
//                 </div>

//                 {/* Document Preview */}
//                 <div className="p-4">
//                   <div className={`border rounded-lg overflow-hidden ${
//                     isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
//                   }`}>
//                     {doc.document_url?.endsWith('.pdf') ? (
//                       <div className="p-8 text-center">
//                         <a
//                           href={doc.document_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                             isDarkMode 
//                               ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
//                               : 'bg-red-50 text-red-600 hover:bg-red-100'
//                           }`}
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                           </svg>
//                           View PDF Document
//                         </a>
//                       </div>
//                     ) : (
//                       <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
//                         <img
//                           src={doc.document_url}
//                           alt={DOC_TYPES[doc.document_type]?.label}
//                           className="w-full h-48 object-contain hover:opacity-90 transition"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'2\' y=\'2\' width=\'20\' height=\'20\' rx=\'2.18\' ry=\'2.18\'%3E%3C/rect%3E%3Cline x1=\'9\' y1=\'9\' x2=\'15\' y2=\'15\'%3E%3C/line%3E%3Cline x1=\'15\' y1=\'9\' x2=\'9\' y2=\'15\'%3E%3C/line%3E%3C/svg%3E';
//                           }}
//                         />
//                       </a>
//                     )}
//                   </div>

//                   {/* Upload Date */}
//                   <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                     Uploaded: {new Date(doc.created_at).toLocaleString()}
//                   </p>

//                   {/* Rejection Reason */}
//                   {doc.status === 'rejected' && doc.rejection_reason && (
//                     <div className={`mt-3 p-3 border rounded-lg ${
//                       isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
//                     }`}>
//                       <p className={`text-xs font-medium mb-1 ${
//                         isDarkMode ? 'text-red-400' : 'text-red-800'
//                       }`}>Rejection Reason:</p>
//                       <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
//                         {doc.rejection_reason}
//                       </p>
//                     </div>
//                   )}

//                   {/* Actions */}
//                   {doc.status === 'pending' && !isProviderApproved && (
//                     <div className="mt-4 flex gap-2">
//                       <button
//                         onClick={() => handleApproveDocument(doc.id)}
//                         disabled={processing}
//                         className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => handleRejectDocument(doc.id)}
//                         disabled={processing}
//                         className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                         Reject
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




















'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from '../../../layout';

const DOC_TYPES = {
  profile_photo: { label: 'Profile Photo', icon: '👤', required: true, description: 'Clear, professional photo of yourself' },
  id_proof: { label: 'Government ID', icon: '🆔', required: true, description: "Driver's license, passport, or other government ID" },
  insurance: { label: 'Insurance Document', icon: '📄', required: true, description: 'Liability insurance certificate' },
  trade_license: { label: 'Trade License', icon: '📜', required: false, description: 'Optional - if applicable for your trade' }
};

// ─── Modal Components ────────────────────────────────────────────────────────

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmColor = 'green', icon, isDarkMode }) {
  if (!isOpen) return null;
  const colors = {
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <div className="p-6">
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${confirmColor === 'green' ? 'bg-green-50' : 'bg-red-50'}`}>
              {icon}
            </div>
          )}
          <h3 className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{message}</p>
        </div>
        <div className={`flex gap-3 px-6 pb-6`}>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition ${colors[confirmColor]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptModal({ isOpen, onClose, onConfirm, title, message, placeholder, confirmLabel = 'Submit', confirmColor = 'green', icon, isDarkMode }) {
  const [value, setValue] = useState('');
  if (!isOpen) return null;
  const colors = { green: 'bg-green-600 hover:bg-green-700', red: 'bg-red-600 hover:bg-red-700' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <div className="p-6">
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${confirmColor === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
              {icon}
            </div>
          )}
          <h3 className={`text-lg font-bold text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{message}</p>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
          />
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={() => { setValue(''); onClose(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Cancel
          </button>
          <button
            onClick={() => { if (value.trim()) { onConfirm(value.trim()); setValue(''); onClose(); } }}
            disabled={!value.trim()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${colors[confirmColor]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastNotification({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };
  const icons = {
    success: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    error: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    info: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium max-w-sm ${styles[toast.type]}`}>
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <span>{toast.message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewDocuments({ params }) {
  const { providerId } = React.use(params);
  const router = useRouter();
  const { isDarkMode } = useAdminTheme();

  const [provider, setProvider] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState(null);

  // Modal states
  const [modal, setModal] = useState({ type: null, data: null });

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { loadData(); }, [providerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/providers/${providerId}/documents`);
      const data = await res.json();
      if (data.success) {
        setProvider(data.provider);
        const docMap = new Map();
        data.documents.forEach(doc => {
          const existing = docMap.get(doc.document_type);
          if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
            docMap.set(doc.document_type, doc);
          }
        });
        setDocuments(Array.from(docMap.values()));
        setBankAccount(data.bankAccount);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (docId) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_document', documentId: docId })
      });
      if (res.ok) { showToast('Document approved successfully!', 'success'); loadData(); }
    } catch { showToast('Failed to approve document', 'error'); }
    finally { setProcessing(false); }
  };

  const handleRejectDocument = async (docId, reason) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_document', documentId: docId, rejectionReason: reason })
      });
      if (res.ok) { showToast('Document rejected with reason saved.', 'info'); loadData(); }
    } catch { showToast('Failed to reject document', 'error'); }
    finally { setProcessing(false); }
  };

  const handleApproveProvider = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'approve' })
      });
      if (res.ok) {
        showToast('Provider approved! Email sent.', 'success');
        await loadData();
        setTimeout(() => router.push('/admin/providers'), 1500);
      }
    } catch { showToast('Failed to approve provider', 'error'); }
    finally { setProcessing(false); }
  };

  const handleRejectProvider = async (reason) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'reject', rejectionReason: reason })
      });
      if (res.ok) { showToast('Provider rejected.', 'info'); router.push('/admin/providers'); }
    } catch { showToast('Failed to reject provider', 'error'); }
    finally { setProcessing(false); }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200',
      pending: isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-amber-100 text-amber-700 border-amber-200',
      rejected: isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = { approved: '✓', pending: '⏳', rejected: '✗' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDocuments = activeTab === 'all' ? documents : documents.filter(d => d.status === activeTab);
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };
  const isProviderApproved = provider?.status === 'active';
  const allRequiredApproved = ['profile_photo', 'id_proof', 'insurance'].every(
    type => documents.some(d => d.document_type === type && d.status === 'approved')
  );

  const card = `rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`;
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtext = isDarkMode ? 'text-slate-400' : 'text-gray-500';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>

      {/* ── Toast ── */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* ── Confirm: Approve Document ── */}
      <ConfirmModal
        isOpen={modal.type === 'approve_doc'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={() => handleApproveDocument(modal.data?.docId)}
        title="Approve Document"
        message="Are you sure you want to approve this document? The provider will be notified."
        confirmLabel="Yes, Approve"
        confirmColor="green"
        isDarkMode={isDarkMode}
        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
      />

      {/* ── Prompt: Reject Document ── */}
      <PromptModal
        isOpen={modal.type === 'reject_doc'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={(reason) => handleRejectDocument(modal.data?.docId, reason)}
        title="Reject Document"
        message="Provide a reason for rejection. This will be shared with the provider."
        placeholder="e.g. Image is blurry or document has expired..."
        confirmLabel="Reject Document"
        confirmColor="red"
        isDarkMode={isDarkMode}
        icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
      />

      {/* ── Confirm: Approve Provider ── */}
      <ConfirmModal
        isOpen={modal.type === 'approve_provider'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={handleApproveProvider}
        title="Approve Provider"
        message={`Approve ${provider?.name}? They will receive an email and can start accepting jobs immediately.`}
        confirmLabel="Approve & Notify"
        confirmColor="green"
        isDarkMode={isDarkMode}
        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* ── Prompt: Reject Provider ── */}
      <PromptModal
        isOpen={modal.type === 'reject_provider'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={handleRejectProvider}
        title="Reject Provider"
        message={`You're about to reject ${provider?.name}'s application. Please provide a detailed reason.`}
        placeholder="e.g. Insurance document could not be verified..."
        confirmLabel="Reject Provider"
        confirmColor="red"
        isDarkMode={isDarkMode}
        icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* ── Header ── */}
      <div className={`border-b sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className={`p-2 rounded-xl transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className={`text-xl font-bold ${text}`}>Review Provider Documents</h1>
              <p className={`text-sm ${subtext}`}>Verify documents before approving the provider</p>
            </div>
          </div>

          {!isProviderApproved ? (
            <div className="flex gap-2.5">
              <button
                onClick={() => setModal({ type: 'approve_provider' })}
                disabled={processing || !allRequiredApproved}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${allRequiredApproved ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200' : isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approve Provider
              </button>
              <button
                onClick={() => setModal({ type: 'reject_provider' })}
                disabled={processing}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject Provider
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-semibold text-sm">Provider Approved</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Provider Info ── */}
        <div className={card + ' p-6'}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${subtext}`}>Provider Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[['Full Name', provider?.name], ['Email', provider?.email], ['Phone', provider?.phone],
              ['Specialty', provider?.specialty || 'Not specified'], ['Experience', `${provider?.experience_years || 0} years`], ['City', provider?.city || 'Not specified']
            ].map(([label, value]) => (
              <div key={label}>
                <p className={`text-xs mb-1 ${subtext}`}>{label}</p>
                <p className={`text-sm font-medium ${text}`}>{value}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-3">
              <p className={`text-xs mb-1 ${subtext}`}>Bio</p>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{provider?.bio || 'No bio provided'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed flex gap-2 items-center flex-wrap" style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}>
            <span className={`text-xs font-medium ${subtext}`}>Account Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              provider?.status === 'active' ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : provider?.status === 'rejected' ? isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
              : isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-amber-100 text-amber-800'
            }`}>
              {provider?.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Stripe Info ── */}
        <div className={card + ' p-6'}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${subtext}`}>Payment Setup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['Stripe Account', provider?.stripe_account_id ? 'connected' : 'not_connected'],
              ['Onboarding', provider?.stripe_onboarding_complete ? 'complete' : 'pending'],
              ['Account Status', bankAccount?.account_status || 'N/A'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className={`text-xs mb-1.5 ${subtext}`}>{label}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  val === 'connected' || val === 'complete' || val === 'verified'
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : val === 'pending'
                      ? isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-amber-100 text-amber-800'
                      : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-600'
                }`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: text },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Approved', value: stats.approved, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className={card + ' p-4'}>
              <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${subtext}`}>{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab !== 'all' && stats[tab] > 0 && <span className="ml-1 text-xs opacity-70">({stats[tab]})</span>}
            </button>
          ))}
        </div>

        {/* ── Documents Grid ── */}
        {filteredDocuments.length === 0 ? (
          <div className={card + ' p-12 text-center'}>
            <svg className={`mx-auto h-10 w-10 mb-3 ${subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={`text-sm ${subtext}`}>No {activeTab} documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className={`${card} overflow-hidden hover:shadow-md transition`}>
                {/* Card header */}
                <div className={`px-5 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{DOC_TYPES[doc.document_type]?.icon}</span>
                    <div>
                      <p className={`font-semibold text-sm flex items-center gap-1.5 ${text}`}>
                        {DOC_TYPES[doc.document_type]?.label}
                        {DOC_TYPES[doc.document_type]?.required && (
                          <span className="text-xs text-red-400 font-normal">Required</span>
                        )}
                      </p>
                      <p className={`text-xs ${subtext}`}>{DOC_TYPES[doc.document_type]?.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>

                {/* Preview */}
                <div className="p-5">
                  <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    {doc.document_url?.endsWith('.pdf') ? (
                      <div className="p-8 text-center">
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          Open PDF Document
                        </a>
                      </div>
                    ) : (
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <img src={doc.document_url} alt={DOC_TYPES[doc.document_type]?.label}
                          className="w-full h-48 object-contain hover:opacity-90 transition"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      </a>
                    )}
                  </div>

                  <p className={`text-xs mt-2.5 ${subtext}`}>
                    Uploaded {new Date(doc.created_at).toLocaleString()}
                  </p>

                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <div className={`mt-3 p-3.5 rounded-xl border ${isDarkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-100'}`}>
                      <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Rejection Reason</p>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{doc.rejection_reason}</p>
                    </div>
                  )}

                  {doc.status === 'pending' && !isProviderApproved && (
                    <div className="mt-4 flex gap-2.5">
                      <button
                        onClick={() => setModal({ type: 'approve_doc', data: { docId: doc.id } })}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Approve
                      </button>
                      <button
                        onClick={() => setModal({ type: 'reject_doc', data: { docId: doc.id } })}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}