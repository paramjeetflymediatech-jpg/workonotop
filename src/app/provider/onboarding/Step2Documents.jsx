// app/provider/onboarding/Step2Documents.jsx
'use client';

import { useState, useRef, useEffect } from 'react';

const DOC_TYPES = {
  profile_photo: {
    label: 'Profile Photo',
    icon: '👤',
    required: true,
    help: 'Clear, professional photo of yourself',
    accept: '.jpg,.jpeg,.png'
  },
  id_proof: {
    label: 'Government ID (Driver\'s License/Passport)',
    icon: '🆔',
    required: true,
    help: 'Clear photo of your government-issued ID',
    accept: '.jpg,.jpeg,.png,.pdf'
  },
  trade_license: {
    label: 'Trade License/Certification',
    icon: '📜',
    required: false,
    help: 'If applicable for your trade (optional)',
    accept: '.jpg,.jpeg,.png,.pdf'
  },
  insurance: {
    label: 'Insurance Document',
    icon: '📄',
    required: true,
    help: 'Liability insurance certificate',
    accept: '.jpg,.jpeg,.png,.pdf'
  }
};

export default function Step2Documents({ onNext, onBack }) {
  const [documents, setDocuments] = useState({});
  const [documentStatus, setDocumentStatus] = useState({});
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  
  const fileInputRefs = {
    profile_photo: useRef(),
    id_proof: useRef(),
    trade_license: useRef(),
    insurance: useRef()
  };

  // Load existing documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/provider/onboarding/documents');
      const data = await res.json();
      
      if (data.success) {
        // Get latest version of each document type
        const docsMap = {};
        const statusMap = {};
        
        data.documents.forEach(doc => {
          // Only keep the latest version
          if (!docsMap[doc.document_type] || 
              new Date(doc.created_at) > new Date(docsMap[doc.document_type].created_at)) {
            docsMap[doc.document_type] = doc.document_url;
            statusMap[doc.document_type] = doc.status;
          }
        });
        
        setDocuments(docsMap);
        setDocumentStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (type, file) => {
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: 'Please upload JPG, PNG, or PDF file' }));
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/provider/onboarding/upload-document', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        // Update UI
        setDocuments(prev => ({ ...prev, [type]: data.fileUrl }));
        setDocumentStatus(prev => ({ ...prev, [type]: 'pending' }));
        
        // Show success message briefly
        setTimeout(() => {
          setErrors(prev => ({ ...prev, [type]: '✅ Upload successful!' }));
          setTimeout(() => {
            setErrors(prev => ({ ...prev, [type]: '' }));
          }, 3000);
        }, 500);
      } else {
        setErrors(prev => ({ ...prev, [type]: data.message }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, [type]: 'Upload failed. Please try again.' }));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getStatusBadge = (type) => {
    const status = documentStatus[type];
    if (!status) return null;
    
    const badges = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      approved: '✓ Verified',
      pending: '⏳ Pending Review',
      rejected: '✗ Rejected'
    };
    
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleSubmit = () => {
    // Check required documents
    const required = ['profile_photo', 'id_proof', 'insurance'];
    const missing = required.filter(type => !documents[type]);
    
    if (missing.length > 0) {
      alert(`Please upload: ${missing.map(t => DOC_TYPES[t].label).join(', ')}`);
      return;
    }

    // Check if any are rejected
    const rejected = required.filter(type => documentStatus[type] === 'rejected');
    if (rejected.length > 0) {
      alert('Please fix rejected documents before continuing');
      return;
    }

    onNext({ documents: documents });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const allRequiredUploaded = ['profile_photo', 'id_proof', 'insurance']
    .every(type => documents[type]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
      
      <div className="space-y-4">
        {Object.entries(DOC_TYPES).map(([type, config]) => (
          <div key={type} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{config.icon}</span>
                  <label className="font-medium text-gray-900">
                    {config.label}
                    {config.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {getStatusBadge(type)}
                </div>
                <p className="text-sm text-gray-500 mt-1">{config.help}</p>
                
                {documents[type] && (
                  <p className="text-xs text-gray-400 mt-1">
                    File: {documents[type].split('/').pop()}
                  </p>
                )}
              </div>
              
              <div className="ml-4">
                {documents[type] ? (
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${
                      documentStatus[type] === 'approved' ? 'border-green-500 bg-green-50' :
                      documentStatus[type] === 'rejected' ? 'border-red-500 bg-red-50' :
                      'border-teal-500 bg-teal-50'
                    }`}>
                      {documentStatus[type] === 'approved' && (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {documentStatus[type] === 'rejected' && (
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {(!documentStatus[type] || documentStatus[type] === 'pending') && (
                        <span className="text-2xl">📄</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRefs[type].current.click()}
                      className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-1 rounded-full hover:bg-teal-700"
                      title="Replace file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs[type].current.click()}
                    disabled={uploading[type]}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {uploading[type] ? 'Uploading...' : 'Upload'}
                  </button>
                )}
                
                <input
                  ref={fileInputRefs[type]}
                  type="file"
                  accept={config.accept}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(type, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>
            
            {errors[type] && (
              <p className={`mt-2 text-sm ${
                errors[type].includes('✅') ? 'text-green-600' : 'text-red-500'
              }`}>
                {errors[type]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Upload Progress:</p>
        <div className="flex gap-4">
          {['profile_photo', 'id_proof', 'insurance'].map(type => (
            <div key={type} className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-1 ${
                documents[type] ? 
                  documentStatus[type] === 'approved' ? 'bg-green-500' :
                  documentStatus[type] === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  : 'bg-gray-300'
              }`}></div>
              <span className="text-xs text-gray-600">
                {type === 'profile_photo' ? 'Photo' : 
                 type === 'id_proof' ? 'ID' : 'Insurance'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allRequiredUploaded}
          className={`px-6 py-2 rounded-lg transition ${
            allRequiredUploaded 
              ? 'bg-teal-600 text-white hover:bg-teal-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}