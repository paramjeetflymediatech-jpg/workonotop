'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Step1Profile from "./Step1Profile";
import Step2Documents from "./Step2Documents";
import Step3Stripe from "./Step3Stripe";
import Step4Review from "./Step4Review";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: '',
    specialty: '',
    experience_years: '',
    city: '',
    location: '',
    service_areas: [],
    skills: [],
    documents: {
      profile_photo: null,
      id_proof: null,
      trade_license: null,
      insurance: null
    },
    stripeOnboardingComplete: false
  });

  useEffect(() => {
    loadProviderData();
  }, []);

  useEffect(() => {
    if (stepParam && !isNaN(parseInt(stepParam))) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 4) {
        setCurrentStep(step);
      }
    }
  }, [stepParam]);

  const loadProviderData = async () => {
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      
      if (data.success && data.provider) {
        const prov = data.provider;
        setProvider(prov);

        if (prov) {
          setFormData(prev => ({
            ...prev,
            bio: prov.bio || '',
            specialty: prov.specialty || '',
            experience_years: prov.experience_years || '',
            city: prov.city || '',
            location: prov.location || '',
            service_areas: Array.isArray(prov.service_areas) ? prov.service_areas : [],
            skills: Array.isArray(prov.skills) ? prov.skills : []
          }));
        }

        if (prov.stripe_onboarding_complete) {
          setFormData(prev => ({ ...prev, stripeOnboardingComplete: true }));
        }

        if (prov.status === 'active') {
          // If they are on step 3 and haven't connected Stripe, let them stay
          if (stepParam === '3' && !prov.stripe_onboarding_complete) {
            setCurrentStep(3);
            setLoading(false);
            return;
          }
          router.push('/provider/dashboard');
          return;
        }

        if (prov.onboarding_completed === 1) {
          if (!prov.documents_uploaded) {
            const urlStep = stepParam ? parseInt(stepParam) : null;
            if (urlStep === 2) {
              setCurrentStep(2);
              setLoading(false);
              return;
            }
            router.push('/provider/onboarding?step=2');
            return;
          }

          router.push('/provider/pending');
          return;
        }

        const urlStep = stepParam ? parseInt(stepParam) : null;
        const dbStep = prov.onboarding_step || 1;
        const resolvedStep = (urlStep && urlStep <= dbStep) ? urlStep : Math.min(dbStep, 4);
        setCurrentStep(resolvedStep);

      } else {
        router.push('/provider/login');
      }
    } catch (error) {
      console.error('Error loading provider:', error);
      router.push('/provider/login');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (stepData) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (provider?.status === 'active' && provider?.onboarding_completed === 1) {
      if (stepData?.stripeOnboardingComplete) {
        router.push('/provider/dashboard');
        return;
      }
    }

    const nextStep = currentStep + 1;

    // Persist step to database
    try {
      await fetch('/api/provider/onboarding/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep })
      });
    } catch (err) {
      console.error('Failed to persist step:', err);
    }

    setCurrentStep(nextStep);
    router.push(`/provider/onboarding?step=${nextStep}`);
  };

  const handleBack = () => {
    if (provider?.status === 'active' && provider?.onboarding_completed === 1 && currentStep === 3) {
      router.push('/provider/dashboard');
      return;
    }
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    router.push(`/provider/onboarding?step=${prevStep}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const isActiveProviderStripeOnly =
    provider?.status === 'active' &&
    provider?.onboarding_completed === 1 &&
    !provider?.stripe_onboarding_complete;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {isActiveProviderStripeOnly ? (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
              💳 Connect your Stripe account to start accepting jobs
            </div>
          </div>
        ) : (
          <div className="mb-12 relative px-2">
            {/* Background Line */}
            <div className="absolute top-4 md:top-5 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200" />
            
            <div className="flex justify-between items-start relative z-10">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0
                    ${currentStep > step ? 'bg-teal-600 text-white shadow-md' :
                      currentStep === step ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-md' :
                      'bg-white text-gray-500 border-2 border-gray-200'}
                  `}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className={`
                    mt-2 text-[10px] md:text-sm font-bold text-center uppercase tracking-wider
                    ${currentStep === step ? 'text-teal-600' : 'text-gray-400'}
                  `}>
                    {step === 1 ? 'Profile' : step === 2 ? 'Docs' : step === 3 ? 'Pay' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {currentStep === 1 && (
            <Step1Profile
              initialData={formData}
              onNext={handleNext}
              providerId={provider?.id}
            />
          )}
          {currentStep === 2 && (
            <Step2Documents
              initialData={formData.documents}
              onNext={handleNext}
              onBack={handleBack}
              providerId={provider?.id}
            />
          )}
          {currentStep === 3 && (
            <Step3Stripe
              initialData={formData}
              onNext={handleNext}
              onBack={handleBack}
              providerId={provider?.id}
              providerEmail={provider?.email}
            />
          )}
          {currentStep === 4 && (
            <Step4Review
              formData={formData}
              onBack={handleBack}
              providerId={provider?.id}
            />
          )}
        </div>

        {!isActiveProviderStripeOnly && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Step {currentStep} of 4
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProviderOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}