'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Step1Profile from "../Step1Profile";
import Step2Documents from "../Step2Documents";
import Step3Stripe from "../Step3Stripe";
import Step4Review from "../Step4Review";

export default function ProviderOnboarding() {
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
    city: 'Calgary',
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

  // Handle step from URL parameter
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
        setProvider(data.provider);
        
        // Set current step based on database
        const dbStep = data.provider.onboarding_step || 1;
        setCurrentStep(dbStep > 4 ? 4 : dbStep);
        
        // Load existing profile data
        if (data.provider.bio) {
          setFormData(prev => ({
            ...prev,
            bio: data.provider.bio || '',
            specialty: data.provider.specialty || '',
            experience_years: data.provider.experience_years || '',
            city: data.provider.city || 'Calgary',
            location: data.provider.location || '',
            service_areas: data.provider.service_areas || [],
            skills: data.provider.skills || []
          }));
        }

        // Load Stripe status
        if (data.provider.stripe_onboarding_complete) {
          setFormData(prev => ({
            ...prev,
            stripeOnboardingComplete: true
          }));
        }

        // Check if already completed
        if (data.provider.onboarding_completed === 1) {
          if (data.provider.status === 'active') {
            router.push('/provider/dashboard');
          } else {
            router.push('/provider/pending');
          }
        }
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
    
    // Move to next step
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Update URL with step
    router.push(`/provider/onboarding?step=${nextStep}`);
  };

  const handleBack = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${currentStep > step ? 'bg-teal-600 text-white' : 
                    currentStep === step ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 
                    'bg-gray-200 text-gray-600'}
                `}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
            <span className={currentStep === 1 ? 'text-teal-600' : ''}>Profile</span>
            <span className={currentStep === 2 ? 'text-teal-600' : ''}>Documents</span>
            <span className={currentStep === 3 ? 'text-teal-600' : ''}>Payment</span>
            <span className={currentStep === 4 ? 'text-teal-600' : ''}>Review</span>
          </div>
        </div>

        {/* Step Components */}
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

        {/* Step indicator text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Step {currentStep} of 4
        </p>
      </div>
    </div>
  );
}