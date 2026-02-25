





// // app/admin/providers/[providerId]/documents/page.jsx - SIMPLIFIED VERSION
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

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
//   const router = useRouter();
//   const { providerId } = params;
  
//   const [provider, setProvider] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [bankAccount, setBankAccount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [activeTab, setActiveTab] = useState('all');

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const res = await fetch(`/api/admin/providers/${providerId}/documents`);
//       const data = await res.json();
//       if (data.success) {
//         setProvider(data.provider);
        
//         // Group documents by type and get latest
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
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ SIMPLIFIED: Approve with confirm
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

//   // ✅ SIMPLIFIED: Reject with prompt (reason)
//   const handleRejectDocument = async (docId) => {
//     const reason = prompt('❌ Why are you rejecting this document? (Reason will be sent to provider)');
//     if (!reason) return; // Cancel if no reason
    
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
//         router.push('/admin/providers');
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
//       approved: 'bg-green-100 text-green-800 border-green-200',
//       pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       rejected: 'bg-red-100 text-red-800 border-red-200'
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
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => router.back()}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Review Provider Documents</h1>
//                 <p className="text-sm text-gray-500">Review and verify all documents before approval</p>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleApproveProvider}
//                 disabled={processing || !allRequiredApproved}
//                 className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
//                   allRequiredApproved 
//                     ? 'bg-green-600 text-white hover:bg-green-700' 
//                     : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                 }`}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 Approve Provider
//               </button>
//               <button
//                 onClick={handleRejectProvider}
//                 disabled={processing}
//                 className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 Reject Provider
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Provider Info Card */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
//           <div className="grid grid-cols-3 gap-6">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Full Name</p>
//               <p className="font-medium text-gray-900">{provider?.name}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Email</p>
//               <p className="font-medium text-gray-900">{provider?.email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Phone</p>
//               <p className="font-medium text-gray-900">{provider?.phone}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Specialty</p>
//               <p className="font-medium text-gray-900 capitalize">{provider?.specialty || 'Not specified'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Experience</p>
//               <p className="font-medium text-gray-900">{provider?.experience_years || 0} years</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">City</p>
//               <p className="font-medium text-gray-900">{provider?.city || 'Not specified'}</p>
//             </div>
//             <div className="col-span-3">
//               <p className="text-sm text-gray-500 mb-1">Bio</p>
//               <p className="text-gray-700">{provider?.bio || 'No bio provided'}</p>
//             </div>
//           </div>
//         </div>

//         {/* Stripe Info Card */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
//           <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//             </svg>
//             Payment Setup
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Stripe Account</p>
//               {provider?.stripe_account_id ? (
//                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   Connected
//                 </span>
//               ) : (
//                 <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Not Connected</span>
//               )}
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Onboarding Status</p>
//               {provider?.stripe_onboarding_complete ? (
//                 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Complete</span>
//               ) : (
//                 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>
//               )}
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Account Status</p>
//               <span className={`px-3 py-1 rounded-full text-sm ${
//                 bankAccount?.account_status === 'verified' ? 'bg-green-100 text-green-800' :
//                 bankAccount?.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                 'bg-gray-100 text-gray-800'
//               }`}>
//                 {bankAccount?.account_status || 'N/A'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl shadow-sm border p-4">
//             <p className="text-sm text-gray-500">Total Documents</p>
//             <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-4">
//             <p className="text-sm text-gray-500">Pending</p>
//             <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-4">
//             <p className="text-sm text-gray-500">Approved</p>
//             <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-4">
//             <p className="text-sm text-gray-500">Rejected</p>
//             <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b mb-6">
//           <nav className="flex gap-4">
//             {['all', 'pending', 'approved', 'rejected'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
//                   activeTab === tab
//                     ? 'border-teal-600 text-teal-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {tab} {tab !== 'all' && `(${stats[tab]})`}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Documents Grid */}
//         {filteredDocuments.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
//             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <p className="mt-4 text-gray-500">No {activeTab} documents found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredDocuments.map((doc) => (
//               <div key={doc.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
//                 {/* Header */}
//                 <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <span className="text-3xl">{DOC_TYPES[doc.document_type]?.icon}</span>
//                     <div>
//                       <h3 className="font-medium text-gray-900 flex items-center gap-2">
//                         {DOC_TYPES[doc.document_type]?.label}
//                         {DOC_TYPES[doc.document_type]?.required && (
//                           <span className="text-xs text-red-500 font-normal">*Required</span>
//                         )}
//                       </h3>
//                       <p className="text-xs text-gray-500">{DOC_TYPES[doc.document_type]?.description}</p>
//                     </div>
//                   </div>
//                   {getStatusBadge(doc.status)}
//                 </div>

//                 {/* Document Preview */}
//                 <div className="p-4">
//                   <div className="border rounded-lg overflow-hidden bg-gray-50">
//                     {doc.document_url?.endsWith('.pdf') ? (
//                       <div className="p-8 text-center">
//                         <a
//                           href={doc.document_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
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
//                   <p className="text-xs text-gray-500 mt-2">
//                     Uploaded: {new Date(doc.created_at).toLocaleString()}
//                   </p>

//                   {/* Rejection Reason */}
//                   {doc.status === 'rejected' && doc.rejection_reason && (
//                     <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
//                       <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
//                       <p className="text-xs text-red-600">{doc.rejection_reason}</p>
//                     </div>
//                   )}

//                   {/* Actions - SIMPLIFIED with confirm and prompt */}
//                   {doc.status === 'pending' && (
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





















// app/admin/providers/[providerId]/documents/page.jsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DOC_TYPES = {
  profile_photo: { 
    label: 'Profile Photo', 
    icon: '👤', 
    required: true,
    description: 'Clear, professional photo of yourself'
  },
  id_proof: { 
    label: 'Government ID', 
    icon: '🆔', 
    required: true,
    description: 'Driver\'s license, passport, or other government ID'
  },
  insurance: { 
    label: 'Insurance Document', 
    icon: '📄', 
    required: true,
    description: 'Liability insurance certificate'
  },
  trade_license: { 
    label: 'Trade License', 
    icon: '📜', 
    required: false,
    description: 'Optional - if applicable for your trade'
  }
};

export default function ReviewDocuments({ params }) {
  const router = useRouter();
  const { providerId } = params;
  
  const [provider, setProvider] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`);
      const data = await res.json();
      if (data.success) {
        setProvider(data.provider);
        
        // Group documents by type and get latest
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve document
  const handleApproveDocument = async (docId) => {
    if (!confirm('✅ Approve this document?')) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_document', documentId: docId })
      });
      
      if (res.ok) {
        alert('Document approved successfully!');
        loadData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to approve document');
    } finally {
      setProcessing(false);
    }
  };

  // Reject document with prompt
  const handleRejectDocument = async (docId) => {
    const reason = prompt('❌ Why are you rejecting this document? (Reason will be sent to provider)');
    if (!reason) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject_document', 
          documentId: docId,
          rejectionReason: reason 
        })
      });
      
      if (res.ok) {
        alert('Document rejected! Reason saved.');
        loadData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reject document');
    } finally {
      setProcessing(false);
    }
  };

  // 🔴 FIX: Approve Provider with button hide logic
  const handleApproveProvider = async () => {
    const requiredDocs = ['profile_photo', 'id_proof', 'insurance'];
    const approvedTypes = documents.filter(d => d.status === 'approved').map(d => d.document_type);
    const missing = requiredDocs.filter(t => !approvedTypes.includes(t));
    
    if (missing.length > 0) {
      alert(`Please approve all required documents first: ${missing.join(', ')}`);
      return;
    }

    if (!confirm('Approve this provider? They will be able to start working.')) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'approve' })
      });
      
      if (res.ok) {
        alert('✅ Provider approved! Email sent.');
        // 🔴 IMPORTANT: Refresh data to update provider status
        await loadData();
        // Optional: redirect after short delay
        setTimeout(() => {
          router.push('/admin/providers');
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to approve provider');
    } finally {
      setProcessing(false);
    }
  };

  // Reject provider
  const handleRejectProvider = async () => {
    const reason = prompt('❌ Why are you rejecting this provider?');
    if (!reason) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, action: 'reject', rejectionReason: reason })
      });
      
      if (res.ok) {
        alert('Provider rejected');
        router.push('/admin/providers');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reject provider');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      approved: '✓ Approved',
      pending: '⏳ Pending',
      rejected: '✗ Rejected'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(d => d.status === activeTab);

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  // 🔴 Check if provider is already approved
  const isProviderApproved = provider?.status === 'active';
  const allRequiredApproved = ['profile_photo', 'id_proof', 'insurance'].every(
    type => documents.some(d => d.document_type === type && d.status === 'approved')
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Provider Documents</h1>
                <p className="text-sm text-gray-500">Review and verify all documents before approval</p>
              </div>
            </div>
            
            {/* 🔴 FIX: Buttons show only if provider is NOT approved */}
            {!isProviderApproved ? (
              <div className="flex gap-3">
                <button
                  onClick={handleApproveProvider}
                  disabled={processing || !allRequiredApproved}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
                    allRequiredApproved 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Provider
                </button>
                <button
                  onClick={handleRejectProvider}
                  disabled={processing}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Provider
                </button>
              </div>
            ) : (
              // 🔴 Show approved badge instead of buttons
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-green-700">Provider Approved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Provider Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="font-medium text-gray-900">{provider?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{provider?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-medium text-gray-900">{provider?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Specialty</p>
              <p className="font-medium text-gray-900 capitalize">{provider?.specialty || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Experience</p>
              <p className="font-medium text-gray-900">{provider?.experience_years || 0} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">City</p>
              <p className="font-medium text-gray-900">{provider?.city || 'Not specified'}</p>
            </div>
            <div className="col-span-3">
              <p className="text-sm text-gray-500 mb-1">Bio</p>
              <p className="text-gray-700">{provider?.bio || 'No bio provided'}</p>
            </div>
          </div>
          
          {/* 🔴 Show provider status badge */}
          <div className="mt-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              provider?.status === 'active' ? 'bg-green-100 text-green-800' :
              provider?.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              Status: {provider?.status?.toUpperCase()}
            </span>
            {provider?.approved_at && (
              <span className="text-xs text-gray-500">
                Approved on: {new Date(provider.approved_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Stripe Info Card - same as before */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Setup
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Stripe Account</p>
              {provider?.stripe_account_id ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Not Connected</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Onboarding Status</p>
              {provider?.stripe_onboarding_complete ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Complete</span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Account Status</p>
              <span className={`px-3 py-1 rounded-full text-sm ${
                bankAccount?.account_status === 'verified' ? 'bg-green-100 text-green-800' :
                bankAccount?.account_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {bankAccount?.account_status || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Documents</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="flex gap-4">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                  activeTab === tab
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} {tab !== 'all' && `(${stats[tab]})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">No {activeTab} documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{DOC_TYPES[doc.document_type]?.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {DOC_TYPES[doc.document_type]?.label}
                        {DOC_TYPES[doc.document_type]?.required && (
                          <span className="text-xs text-red-500 font-normal">*Required</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">{DOC_TYPES[doc.document_type]?.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>

                {/* Document Preview */}
                <div className="p-4">
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    {doc.document_url?.endsWith('.pdf') ? (
                      <div className="p-8 text-center">
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          View PDF Document
                        </a>
                      </div>
                    ) : (
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={doc.document_url}
                          alt={DOC_TYPES[doc.document_type]?.label}
                          className="w-full h-48 object-contain hover:opacity-90 transition"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'2\' y=\'2\' width=\'20\' height=\'20\' rx=\'2.18\' ry=\'2.18\'%3E%3C/rect%3E%3Cline x1=\'9\' y1=\'9\' x2=\'15\' y2=\'15\'%3E%3C/line%3E%3Cline x1=\'15\' y1=\'9\' x2=\'9\' y2=\'15\'%3E%3C/line%3E%3C/svg%3E';
                          }}
                        />
                      </a>
                    )}
                  </div>

                  {/* Upload Date */}
                  <p className="text-xs text-gray-500 mt-2">
                    Uploaded: {new Date(doc.created_at).toLocaleString()}
                  </p>

                  {/* Rejection Reason */}
                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-600">{doc.rejection_reason}</p>
                    </div>
                  )}

                  {/* Actions - Hide if provider is approved */}
                  {doc.status === 'pending' && !isProviderApproved && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleApproveDocument(doc.id)}
                        disabled={processing}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDocument(doc.id)}
                        disabled={processing}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Show message if provider is approved */}
                  {doc.status === 'pending' && isProviderApproved && (
                    <div className="mt-4 p-2 bg-gray-100 text-center text-sm text-gray-600 rounded-lg">
                      Provider already approved - documents locked
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