'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Step4Review({ formData, onBack, providerId, onComplete }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingDocs(true);
      
      // Load provider profile
      const profileRes = await fetch('/api/provider/me');
      const profileData = await profileRes.json();
      
      if (profileData.success && profileData.provider) {
        setProvider(profileData.provider);
      }

      // Load actual documents from API
      const docsRes = await fetch('/api/provider/onboarding/documents');
      const docsData = await docsRes.json();
      
      if (docsData.success) {
        // Group by document type and get latest
        const docMap = new Map();
        docsData.documents.forEach(doc => {
          const existing = docMap.get(doc.document_type);
          if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
            docMap.set(doc.document_type, doc);
          }
        });
        
        setDocuments(Array.from(docMap.values()));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/provider/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/provider/pending');
      } else {
        setError(data.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get documents from API response
  const getUploadedDocuments = () => {
    const uploadedDocs = [];
    
    if (documents.length > 0) {
      documents.forEach(doc => {
        let name = '';
        if (doc.document_type === 'profile_photo') name = 'Profile Photo';
        else if (doc.document_type === 'id_proof') name = 'Government ID';
        else if (doc.document_type === 'insurance') name = 'Insurance Document';
        else if (doc.document_type === 'trade_license') name = 'Trade License';
        
        uploadedDocs.push({
          type: doc.document_type,
          name: name,
          uploaded: true,
          status: doc.status,
          url: doc.document_url
        });
      });
    }
    // Fallback to formData if available
    else if (formData?.documents) {
      if (formData.documents.profile_photo) uploadedDocs.push({ type: 'profile_photo', name: 'Profile Photo', uploaded: true });
      if (formData.documents.id_proof) uploadedDocs.push({ type: 'id_proof', name: 'Government ID', uploaded: true });
      if (formData.documents.insurance) uploadedDocs.push({ type: 'insurance', name: 'Insurance Document', uploaded: true });
      if (formData.documents.trade_license) uploadedDocs.push({ type: 'trade_license', name: 'Trade License', uploaded: true });
    }
    
    return uploadedDocs;
  };

  // Get document status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const uploadedDocs = getUploadedDocuments();
  const hasRequiredDocs = ['profile_photo', 'id_proof', 'insurance'].every(
    type => documents.some(d => d.document_type === type)
  );

  if (loadingDocs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Information</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Almost there!</strong> Please review your information before submitting. 
          Once submitted, our admin team will review your application within 24-48 hours.
        </p>
      </div>

      {/* Profile Information */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Information
        </h3>
        <dl className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-gray-500">Full Name</dt>
            <dd className="text-sm font-medium">{provider?.name || formData?.name || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm font-medium">{provider?.email || formData?.email || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-gray-500">Phone</dt>
            <dd className="text-sm font-medium">{provider?.phone || formData?.phone || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-gray-500">Specialty</dt>
            <dd className="text-sm font-medium">{formData?.specialty || provider?.specialty || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-gray-500">Experience</dt>
            <dd className="text-sm font-medium">{formData?.experience_years || provider?.experience_years || '0'} years</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-gray-500">Bio</dt>
            <dd className="text-sm">{formData?.bio || provider?.bio || 'Not provided'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-gray-500">Location</dt>
            <dd className="text-sm">{formData?.location || provider?.location || 'Not provided'}, {formData?.city || provider?.city || 'Calgary'}</dd>
          </div>
        </dl>
      </div>

      {/* Documents Uploaded Section - Clean Version */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents Uploaded ({uploadedDocs.length})
        </h3>
        
        {uploadedDocs.length > 0 ? (
          <ul className="space-y-3">
            {uploadedDocs.map((doc, index) => (
              <li key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{doc.name}</span>
                  {getStatusBadge(doc.status)}
                </div>
                {doc.url && (
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-800 underline"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
        )}
      </div>

      {/* Payment Setup */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Setup
        </h3>
        
        {(provider?.stripe_onboarding_complete || formData?.stripeOnboardingComplete) ? (
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Stripe account connected</span>
            <span className="ml-2 text-xs text-green-600">✓ Verified</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-yellow-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Stripe connection pending</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !provider?.stripe_onboarding_complete || !hasRequiredDocs}
          className={`px-6 py-2 rounded-lg transition flex items-center ${
            !loading && provider?.stripe_onboarding_complete && hasRequiredDocs
              ? 'bg-teal-600 text-white hover:bg-teal-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit for Review'
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        By submitting, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}