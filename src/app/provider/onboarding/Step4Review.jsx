


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
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingDocs(true);
      
      const profileRes = await fetch('/api/provider/me');
      const profileData = await profileRes.json();
      if (profileData.success && profileData.provider) {
        setProvider(profileData.provider);
      }

      const docsRes = await fetch('/api/provider/onboarding/documents');
      const docsData = await docsRes.json();
      if (docsData.success) {
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

  // ✅ Same logic as Step3Stripe — redirect to Stripe onboarding
  const handleReconnectStripe = async () => {
    setReconnecting(true);
    setError('');
    try {
      const refreshUrl = `${window.location.origin}/provider/onboarding?step=3`;
      const returnUrl = `${window.location.origin}/api/provider/onboarding/stripe-return`;

      const res = await fetch('/api/provider/onboarding/create-stripe-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshUrl, returnUrl }),
      });

      const data = await res.json();

      if (data.success && data.onboardingUrl) {
        // Redirect to Stripe — same as Step3
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.message || 'Failed to connect Stripe. Please try again.');
      }
    } catch (err) {
      console.error('Stripe reconnect error:', err);
      setError('Connection failed. Please try again.');
    } finally {
      setReconnecting(false);
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

  const getUploadedDocuments = () => {
    const uploadedDocs = [];
    if (documents.length > 0) {
      documents.forEach(doc => {
        const nameMap = {
          profile_photo: 'Profile Photo',
          id_proof: 'Government ID',
          insurance: 'Insurance Document',
          trade_license: 'Trade License',
        };
        uploadedDocs.push({
          type: doc.document_type,
          name: nameMap[doc.document_type] || doc.document_type,
          status: doc.status,
          url: doc.document_url
        });
      });
    } else if (formData?.documents) {
      const nameMap = {
        profile_photo: 'Profile Photo',
        id_proof: 'Government ID',
        insurance: 'Insurance Document',
        trade_license: 'Trade License',
      };
      Object.entries(formData.documents).forEach(([key, val]) => {
        if (val) uploadedDocs.push({ type: key, name: nameMap[key] || key });
      });
    }
    return uploadedDocs;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const uploadedDocs = getUploadedDocuments();
  const hasRequiredDocs = ['profile_photo', 'id_proof', 'insurance'].every(
    type => documents.some(d => d.document_type === type)
  );
  const stripeComplete = provider?.stripe_onboarding_complete || formData?.stripeOnboardingComplete;

  if (loadingDocs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Almost there!</strong> Please review your information before submitting. 
          Once submitted, our admin team will review your application within 24-48 hours.
        </p>
      </div>

      {/* Profile Information */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Information
        </h3>
        <dl className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-gray-500">Full Name</dt>
            <dd className="text-sm font-medium">{provider?.name || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-gray-500">Email</dt>
            <dd className="text-sm font-medium">{provider?.email || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-gray-500">Specialty</dt>
            <dd className="text-sm font-medium">{formData?.specialty || provider?.specialty || 'Not provided'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-gray-500">Experience</dt>
            <dd className="text-sm font-medium">{formData?.experience_years || provider?.experience_years || '0'} years</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-gray-500">Bio</dt>
            <dd className="text-sm">{formData?.bio || provider?.bio || 'Not provided'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-gray-500">Location</dt>
            <dd className="text-sm">{formData?.location || provider?.location || 'Not provided'}, {formData?.city || provider?.city || 'Calgary'}</dd>
          </div>
        </dl>
      </div>

      {/* Documents */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents Uploaded ({uploadedDocs.length})
        </h3>
        {uploadedDocs.length > 0 ? (
          <ul className="space-y-3">
            {uploadedDocs.map((doc, index) => (
              <li key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{doc.name}</span>
                  {getStatusBadge(doc.status)}
                </div>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-800 underline">
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
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Setup
        </h3>

        {stripeComplete ? (
          <div className="flex items-center text-sm gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Stripe account connected</span>
            <span className="text-xs text-green-600 font-medium">✓ Verified</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Stripe connection pending or incomplete</span>
            </div>

            <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded p-2 leading-relaxed">
              You can reconnect your Stripe account now, or skip and submit for admin review.
              Payment setup can be completed later before you go live.
            </p>

            {/* ✅ Reconnect button — uses same API as Step3Stripe */}
            <button
              onClick={handleReconnectStripe}
              disabled={reconnecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 border-teal-500 text-teal-600 text-sm font-medium hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {reconnecting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Connecting to Stripe...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Reconnect Stripe Account
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
          {error.includes('card_payments') && (
            <p className="text-sm mt-1 text-gray-600">
              This is a Stripe requirement. Both payment processing and transfer capabilities are needed.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>

        {/* ✅ Always enabled — Stripe NOT required to submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !hasRequiredDocs}
          className={`px-6 py-2 rounded-lg transition flex items-center gap-2 font-medium ${
            !loading && hasRequiredDocs
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : stripeComplete ? (
            'Submit for Review'
          ) : (
            'Skip Stripe & Submit for Review'
          )}
        </button>
      </div>

      {!hasRequiredDocs && (
        <p className="text-xs text-center text-red-500">
          Required documents missing: Profile Photo, Government ID, and Insurance must be uploaded before submitting.
        </p>
      )}

      <p className="text-xs text-center text-gray-500">
        By submitting, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}