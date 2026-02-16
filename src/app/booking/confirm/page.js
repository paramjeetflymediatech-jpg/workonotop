







'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function BookingConfirmPage() {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [receiveOffers, setReceiveOffers] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const savedSchedule = sessionStorage.getItem('bookingSchedule');
    const savedDetails = sessionStorage.getItem('bookingDetails');
    const savedUser = localStorage.getItem('workontap_user');

    if (savedSchedule && savedDetails) {
      setScheduleData(JSON.parse(savedSchedule));
      const details = JSON.parse(savedDetails);
      setDetailsData(details);
      
      if (details.address) {
        setAddress(details.address);
      }
    } else {
      router.push('/services');
    }

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }

    setLoading(false);
  }, [router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          password: password,
          hear_about: hearAbout,
          receive_offers: receiveOffers
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('workontap_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
      } else {
        setAuthError(data.message);
      }
    } catch (error) {
      setAuthError('Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('workontap_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setFirstName(data.user.first_name);
        setLastName(data.user.last_name);
        setEmail(data.user.email);
        setPhone(data.user.phone || '');
        setShowAuthModal(false);
      } else {
        setAuthError(data.message);
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('workontap_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  // const handleSubmitBooking = async (e) => {
  //   e.preventDefault();

  //   if (!isAuthenticated) {
  //     setShowAuthModal(true);
  //     return;
  //   }

  //   setSubmitting(true);

  //   const bookingPayload = {
  //     service_id: scheduleData.service_id,
  //     service_name: scheduleData.service_name,
  //     service_price: scheduleData.service_price,
  //     additional_price: scheduleData.additional_price || 0,
  //     first_name: firstName,
  //     last_name: lastName,
  //     email: email,
  //     phone: phone,
  //     job_date: scheduleData.job_date,
  //     job_time_slot: scheduleData.job_time_slot,
  //     timing_constraints: scheduleData.timing_constraints,
  //     job_description: detailsData.job_description,
  //     instructions: detailsData.instructions,
  //     parking_access: detailsData.parking_access,
  //     elevator_access: detailsData.elevator_access,
  //     has_pets: detailsData.has_pets,
  //     address_line1: address,
  //     city: 'Calgary',
  //     province: 'AB',
  //     postal_code: '',
  //     photos: detailsData.photos || [],
  //     user_id: currentUser?.id
  //   };

  //   try {
  //     const res = await fetch('/api/bookings', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(bookingPayload)
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       sessionStorage.clear();
  //       router.push(`/booking/success/${data.booking_id}`);
  //     } else {
  //       alert('Something went wrong. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('Something went wrong. Please try again.');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };




  // Find this function in your BookingConfirmPage component
const handleSubmitBooking = async (e) => {
  e.preventDefault();

  if (!isAuthenticated) {
    setShowAuthModal(true);
    return;
  }

  setSubmitting(true);

  const bookingPayload = {
    service_id: scheduleData.service_id,
    service_name: scheduleData.service_name,
    service_price: scheduleData.service_price,
    additional_price: scheduleData.additional_price || 0,
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    job_date: scheduleData.job_date,
    job_time_slot: scheduleData.job_time_slot, // This is already an array from sessionStorage
    timing_constraints: scheduleData.timing_constraints,
    job_description: detailsData.job_description,
    instructions: detailsData.instructions,
    parking_access: detailsData.parking_access,
    elevator_access: detailsData.elevator_access,
    has_pets: detailsData.has_pets,
    address_line1: address,
    city: 'Calgary',
    province: 'AB',
    postal_code: '',
    photos: detailsData.photos || [],
    user_id: currentUser?.id
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });

    const data = await res.json();
    if (data.success) {
      sessionStorage.clear();
      router.push(`/booking/success/${data.booking_id}`);
    } else {
      alert('Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
  } finally {
    setSubmitting(false);
  }
};







  if (loading || !scheduleData || !detailsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header />

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700 transition">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-green-700 transition">Services</Link>
            <span className="mx-2">›</span>
            <Link href={`/services/${scheduleData.service_id}`} className="hover:text-green-700 transition">{scheduleData.service_name}</Link>
            <span className="mx-2">›</span>
            <Link href="/booking/schedule" className="hover:text-green-700 transition">Schedule</Link>
            <span className="mx-2">›</span>
            <Link href="/booking/details" className="hover:text-green-700 transition">Details</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Confirm</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 3 OF 3</span>
              <span className="text-sm text-gray-500 font-medium">Almost done!</span>
            </div>
            <div className="relative">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Schedule</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Details</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">✨</span>
                    {isAuthenticated ? 'Confirm Your Booking' : 'Create an account to continue'}
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    {isAuthenticated
                      ? `You're logged in as ${currentUser?.email}`
                      : 'You&apos;re one step away from connecting with trusted pros'}
                  </p>
                </div>

                <div className="p-6 md:p-8">
                  {isAuthenticated ? (
                    <div>
                      <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {firstName?.[0]}{lastName?.[0]}
                            </div>
                            <div className="ml-4">
                              <p className="font-bold text-gray-900">{firstName} {lastName}</p>
                              <p className="text-sm text-gray-600">{email}</p>
                              <p className="text-sm text-gray-600">{phone}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                          >
                            Not you?
                          </button>
                        </div>
                      </div>

                      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Service Address</h4>
                            <p className="text-sm text-gray-700">{address}</p>
                            <Link href="/booking/details" className="text-xs text-blue-700 hover:text-blue-800 font-medium mt-2 inline-flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit address
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="terms"
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                              required
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-gray-600">
                              I agree to WorkOnTap&apos;s{' '}
                              <Link href="/terms" className="text-green-700 hover:text-green-800 font-medium underline">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link href="/privacy" className="text-green-700 hover:text-green-800 font-medium underline">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmitBooking}
                        disabled={submitting || !acceptTerms}
                        className={`
                          w-full py-4 rounded-xl font-bold text-lg shadow-lg
                          flex items-center justify-center transition-all duration-300
                          ${submitting || !acceptTerms
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200'
                          }
                        `}
                      >
                        {submitting ? 'Processing...' : 'Confirm & Find a Pro'}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-8">
                        <span className="text-6xl mb-4 block">🔐</span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to book?</h3>
                        <p className="text-gray-600 mb-6">Create an account or log in to continue</p>
                      </div>

                      <div className="space-y-4 max-w-sm mx-auto">
                        <button
                          onClick={() => {
                            setAuthMode('signup');
                            setShowAuthModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition transform hover:scale-[1.02]"
                        >
                          Sign Up
                        </button>

                        <button
                          onClick={() => {
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }}
                          className="w-full border-2 border-green-700 text-green-700 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition"
                        >
                          Log In
                        </button>

                        <p className="text-xs text-gray-500 mt-4">
                          By continuing, you agree to WorkOnTap&apos;s{' '}
                          <Link href="/terms" className="text-green-700 hover:underline">
                            Terms
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-green-700 hover:underline">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <span className="text-green-700">🛡️</span>
                          You&apos;re Protected with WorkOnTap
                        </div>
                        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
                          We&apos;re proud to back every job with our Homeowner Protection Promise so you can be confident you&apos;re getting a high level of service every time.
                          <Link href="/guarantee" className="text-green-700 ml-1 hover:underline">
                            Learn More
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">📋</span>
                      Your booking
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="bg-green-100 rounded-xl p-3">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{scheduleData.service_name}</h4>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-gray-800">{formatDate(scheduleData.job_date)}</span>
                      </div>
                      {/* <div className="flex gap-2 ml-7">
                        <span className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize">
                          {scheduleData.job_time_slot === 'morning' && '🌅 '}
                          {scheduleData.job_time_slot === 'afternoon' && '☀️ '}
                          {scheduleData.job_time_slot === 'evening' && '🌙 '}
                          {scheduleData.job_time_slot}
                        </span>
                      </div> */}



                      {/* Replace the single time slot display with this */}
<div className="flex flex-wrap gap-2 mt-2">
  {scheduleData.job_time_slot?.map((time) => (
    <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
      {time === 'morning' && '🌅'}
      {time === 'afternoon' && '☀️'}
      {time === 'evening' && '🌙'}
      <span className="ml-1">{time}</span>
    </span>
  ))}
</div>




                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700 font-medium mb-1">Service Location</p>
                          <p className="text-xs text-gray-600">{address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {detailsData.job_description}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">{detailsData.photos.length} photo{detailsData.photos.length !== 1 ? 's' : ''} uploaded</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Service price</span>
                        <span className="font-bold text-gray-900">${parseFloat(scheduleData.service_price).toFixed(2)}</span>
                      </div>
                      {scheduleData.additional_price > 0 && (
                        <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                          <span>Additional (if needed)</span>
                          <span>+${parseFloat(scheduleData.additional_price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">🛡️</div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">You&apos;re Protected with WorkOnTap</h4>
                      <p className="text-green-100 text-sm mb-4 leading-relaxed">
                        We back every job with our Homeowner Protection Promise. All pros are licensed, background-checked, and well-rated.
                      </p>
                      <Link href="/guarantee" className="inline-flex items-center bg-white text-green-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-md">
                        Learn more
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5 sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {authMode === 'signup' ? 'Sign Up' : 'Log In'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">
                {authMode === 'signup'
                  ? 'Create a free account with WorkOnTap'
                  : 'Welcome back to WorkOnTap'}
              </p>
            </div>

            <div className="p-6">
              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {authError}
                </div>
              )}

              {authMode === 'signup' ? (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      How did you hear about us?
                    </label>
                    <input
                      type="text"
                      value={hearAbout}
                      onChange={(e) => setHearAbout(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                      placeholder="e.g. social media, from a friend, etc."
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="offers"
                      checked={receiveOffers}
                      onChange={(e) => setReceiveOffers(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 border-2 border-gray-300 rounded"
                    />
                    <label htmlFor="offers" className="ml-2 text-sm text-gray-600">
                      Yes! I&apos;d like to receive news and special offers from WorkOnTap.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating account...' : 'Sign Up'}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By signing up you&apos;re agreeing to WorkOnTap&apos;s{' '}
                    <Link href="/terms" className="text-green-700 hover:underline">
                      Terms and Conditions
                    </Link>
                  </p>

                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="text-sm text-green-700 font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Logging in...' : 'Log In'}
                  </button>

                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError('');
                      }}
                      className="text-sm text-green-700 font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="text-xs text-gray-600">Homeowner Protection Promise</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs text-gray-600">Get confirmed appointments in minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-green-800 font-extrabold text-lg">WorkOnTap</Link>
              <span>© 2026</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-green-700 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-green-700 transition">Privacy</Link>
              <Link href="/guarantee" className="hover:text-green-700 transition">Guarantee</Link>
              <Link href="/help" className="hover:text-green-700 transition">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}