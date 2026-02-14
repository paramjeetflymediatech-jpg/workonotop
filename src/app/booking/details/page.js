// // app/booking/details/page.js - Job Details Page
// // ✅ WorkOnTap green theme — consistent with all other pages
// // ✅ All Jiffy references removed — pure WorkOnTap branding
// // ✅ Fully responsive — mobile, tablet, desktop optimized
// // ✅ Modern photo upload with preview grid
// // ✅ Mobile menu toggle included
// // ✅ Progress tracker with green theme
// // ✅ Character counter for job description

// 'use client';

// import Link from 'next/link';
// import { useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';

// export default function BookingDetailsPage() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [jobDescription, setJobDescription] = useState('');
//   const [photos, setPhotos] = useState([]);
//   const [uploadError, setUploadError] = useState('');
//   const fileInputRef = useRef(null);

//   const maxDescriptionLength = 500;
//   const maxFileSize = 10 * 1024 * 1024; // 10MB
//   const maxPhotos = 5;

//   const handlePhotoUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setUploadError('');

//     // Check total photos limit
//     if (photos.length + files.length > maxPhotos) {
//       setUploadError(`You can only upload up to ${maxPhotos} photos`);
//       return;
//     }

//     // Check file sizes
//     const oversizedFiles = files.filter(file => file.size > maxFileSize);
//     if (oversizedFiles.length > 0) {
//       setUploadError('Some files exceed the 10MB limit');
//       return;
//     }

//     // Check file types
//     const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
//     if (invalidFiles.length > 0) {
//       setUploadError('Please upload only image files');
//       return;
//     }

//     setPhotos([...photos, ...files]);
//   };

//   const removePhoto = (indexToRemove) => {
//     setPhotos(photos.filter((_, index) => index !== indexToRemove));
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   // Service data (would come from context/state in real app)
//   const serviceInfo = {
//     name: 'Appliance Install',
//     icon: '🔌',
//     price: 180,
//     additionalPrice: 90,
//     location: '123 B Avenue Southwest, Calgary AB',
//     selectedDate: 'February 16, 2026',
//     selectedTimes: ['afternoon']
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//     <Header/>

//       {/* ===== BREADCRUMBS ===== */}
//       <div className="bg-white border-b border-gray-200 py-3">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <Link href="/" className="hover:text-green-700 transition">Home</Link>
//             <span className="mx-2">›</span>
//             <Link href="/services" className="hover:text-green-700 transition">Services</Link>
//             <span className="mx-2">›</span>
//             <Link href="/services/appliance-install" className="hover:text-green-700 transition">Appliance Install</Link>
//             <span className="mx-2">›</span>
//             <Link href="/booking/schedule" className="hover:text-green-700 transition">Schedule</Link>
//             <span className="mx-2">›</span>
//             <span className="text-gray-900 font-medium">Job Details</span>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8 md:py-12">
//         <div className="max-w-6xl mx-auto">
          
//           {/* ===== PROGRESS TRACKER – Green theme ===== */}
//           <div className="mb-10 md:mb-12">
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 2 OF 3</span>
//               <span className="text-sm text-gray-500 font-medium">Tell us about your job</span>
//             </div>
//             <div className="relative">
//               <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '66%'}}></div>
//               </div>
//               <div className="flex justify-between mt-2">
//                 <div className="flex flex-col items-start">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
//                     <span className="ml-2 text-sm font-semibold text-green-700">Schedule</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
//                     <span className="ml-2 text-sm font-semibold text-green-700">Details</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-end">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">3</div>
//                     <span className="ml-2 text-sm text-gray-500">Confirm</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
//             Tell us about your job
//           </h1>
//           <p className="text-lg text-gray-600 mb-8 md:mb-10">
//             The more details you provide, the better pros can quote you
//           </p>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//             {/* ===== MAIN FORM - LEFT COLUMN ===== */}
//             <div className="lg:col-span-2 space-y-8">
              
//               {/* ===== JOB DESCRIPTION CARD ===== */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">📝</span>
//                     What do you need done?
//                   </h2>
//                   <p className="text-green-100 text-sm mt-1 ml-1">
//                     Be specific — include make/model if possible
//                   </p>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   <textarea
//                     value={jobDescription}
//                     onChange={(e) => setJobDescription(e.target.value.slice(0, maxDescriptionLength))}
//                     placeholder="e.g. My Whirlpool dishwasher (model WDF540PADM) is not draining. It makes a humming sound but water stays at the bottom. Need someone to diagnose and repair."
//                     className="w-full h-40 md:h-48 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-700 placeholder:text-gray-400 text-base"
//                   />
                  
//                   {/* Character counter */}
//                   <div className="flex justify-between items-center mt-3">
//                     <div className="flex items-center text-xs text-gray-500">
//                       <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                       </svg>
//                       Include details like: issue, make/model, when it started
//                     </div>
//                     <span className={`text-xs font-medium ${jobDescription.length >= maxDescriptionLength ? 'text-red-600' : 'text-gray-500'}`}>
//                       {jobDescription.length}/{maxDescriptionLength}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* ===== PHOTO UPLOAD CARD ===== */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">📸</span>
//                     Upload photos
//                   </h2>
//                   <p className="text-green-100 text-sm mt-1 ml-1">
//                     Show pros exactly what needs to be done
//                   </p>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   {/* Upload error message */}
//                   {uploadError && (
//                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
//                       <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                       </svg>
//                       {uploadError}
//                     </div>
//                   )}

//                   {/* Photo grid */}
//                   {photos.length > 0 && (
//                     <div className="mb-6">
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                         {photos.map((photo, index) => (
//                           <div key={index} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-green-500 transition">
//                             <img
//                               src={URL.createObjectURL(photo)}
//                               alt={`Upload ${index + 1}`}
//                               className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                               <button
//                                 onClick={() => removePhoto(index)}
//                                 className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition"
//                                 aria-label="Remove photo"
//                               >
//                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                                 </svg>
//                               </button>
//                             </div>
//                             <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
//                               {Math.round(photo.size / 1024)}KB
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Upload area */}
//                   {photos.length < maxPhotos ? (
//                     <label className={`
//                       border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer
//                       transition-all duration-200
//                       ${photos.length === 0 
//                         ? 'border-gray-300 hover:border-green-500 hover:bg-green-50/30' 
//                         : 'border-green-300 bg-green-50/20 hover:bg-green-50/50'
//                       }
//                     `}>
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         onChange={handlePhotoUpload}
//                         className="hidden"
//                       />
//                       <div className={`
//                         w-16 h-16 rounded-full flex items-center justify-center mb-3
//                         ${photos.length === 0 ? 'bg-green-100' : 'bg-green-200'}
//                       `}>
//                         <svg className={`w-8 h-8 ${photos.length === 0 ? 'text-green-700' : 'text-green-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                       </div>
//                       <span className="text-green-700 font-bold text-lg mb-1">
//                         {photos.length === 0 ? 'Add Photos' : 'Add More Photos'}
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         PNG, JPG, GIF up to 10MB each
//                       </span>
//                       <span className="text-xs text-gray-400 mt-2">
//                         {photos.length}/{maxPhotos} photos uploaded
//                       </span>
//                     </label>
//                   ) : (
//                     <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
//                       <span className="text-green-700 font-semibold">✓ Maximum photos uploaded</span>
//                       <p className="text-xs text-gray-600 mt-1">You've added {maxPhotos} photos</p>
//                     </div>
//                   )}

//                   <p className="text-xs text-gray-500 mt-4 flex items-center">
//                     <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                     </svg>
//                     Photos help pros give more accurate quotes
//                   </p>
//                 </div>
//               </div>

//               {/* ===== ACCESS & SAFETY (OPTIONAL) ===== */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">🔑</span>
//                     Access & safety (optional)
//                   </h2>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   <div className="space-y-4">
//                     <div className="flex items-start">
//                       <div className="flex items-center h-5">
//                         <input
//                           id="parking"
//                           type="checkbox"
//                           className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
//                         />
//                       </div>
//                       <div className="ml-3 text-sm">
//                         <label htmlFor="parking" className="font-medium text-gray-700">Free street parking available</label>
//                         <p className="text-xs text-gray-500">Let pros know they can park without permits</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-start">
//                       <div className="flex items-center h-5">
//                         <input
//                           id="elevator"
//                           type="checkbox"
//                           className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
//                         />
//                       </div>
//                       <div className="ml-3 text-sm">
//                         <label htmlFor="elevator" className="font-medium text-gray-700">Building has elevator</label>
//                         <p className="text-xs text-gray-500">For apartments/condos</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-start">
//                       <div className="flex items-center h-5">
//                         <input
//                           id="pets"
//                           type="checkbox"
//                           className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
//                         />
//                       </div>
//                       <div className="ml-3 text-sm">
//                         <label htmlFor="pets" className="font-medium text-gray-700">I have pets</label>
//                         <p className="text-xs text-gray-500">Pros will take extra care when entering</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ===== NAVIGATION BUTTONS ===== */}
//               <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
//                 <Link href="/booking/schedule" className="sm:order-1">
//                   <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition font-medium text-gray-700 flex items-center justify-center">
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                     Back
//                   </button>
//                 </Link>
                
//                 <Link 
//                   href={jobDescription.length >= 20 ? "/booking/confirm" : "#"} 
//                   className="sm:order-2"
//                 >
//                   <button 
//                     disabled={jobDescription.length < 20}
//                     className={`
//                       w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg
//                       flex items-center justify-center transition-all duration-300
//                       ${jobDescription.length >= 20
//                         ? 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200' 
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }
//                     `}
//                   >
//                     Continue to review
//                     <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                     </svg>
//                   </button>
//                 </Link>
//               </div>
              
//               {jobDescription.length < 20 && jobDescription.length > 0 && (
//                 <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center">
//                   <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   Please write at least 20 characters to help pros understand your job
//                 </p>
//               )}
              
//               {jobDescription.length === 0 && (
//                 <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center">
//                   <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                   </svg>
//                   Describe your job to continue
//                 </p>
//               )}
//             </div>

//             {/* ===== SIDEBAR - RIGHT COLUMN ===== */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24 space-y-6">
                
//                 {/* Booking Summary Card */}
//                 <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
//                   <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                     <h3 className="text-xl font-bold text-white flex items-center">
//                       <span className="mr-2">📋</span>
//                       Booking summary
//                     </h3>
//                   </div>
                  
//                   <div className="p-6">
//                     {/* Service Info */}
//                     <div className="flex items-start space-x-3 mb-5 pb-5 border-b border-gray-200">
//                       <div className="bg-green-100 rounded-xl p-3">
//                         <span className="text-2xl">{serviceInfo.icon}</span>
//                       </div>
//                       <div>
//                         <h4 className="font-bold text-gray-900">{serviceInfo.name}</h4>
//                         <p className="text-sm text-gray-600 flex items-center mt-1">
//                           <svg className="w-4 h-4 text-green-700 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                           </svg>
//                           {serviceInfo.location}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Selected Date/Time */}
//                     <div className="mb-5 pb-5 border-b border-gray-200">
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
//                         <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                         </svg>
//                         Your schedule
//                       </h4>
//                       <div className="bg-green-50 rounded-lg p-3">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm font-medium text-gray-700">
//                             {serviceInfo.selectedDate}
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-2">
//                           {serviceInfo.selectedTimes.map(time => (
//                             <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
//                               {time === 'morning' && '🌅'}
//                               {time === 'afternoon' && '☀️'}
//                               {time === 'evening' && '🌙'}
//                               <span className="ml-1">{time}</span>
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                       <Link href="/booking/schedule" className="text-xs text-green-700 hover:text-green-800 font-medium mt-2 inline-flex items-center">
//                         <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.038-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//                         </svg>
//                         Edit schedule
//                       </Link>
//                     </div>

//                     {/* Pricing */}
//                     <div className="mb-5 pb-5 border-b border-gray-200">
//                       <div className="bg-green-50 rounded-xl p-4 border border-green-200">
//                         <div className="text-center">
//                           <div className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting at</div>
//                           <div className="text-3xl md:text-4xl font-extrabold text-green-800">${serviceInfo.price}</div>
//                           <div className="text-sm text-gray-600 mt-2">For the first appliance</div>
//                           <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
//                             <span className="text-gray-700">Additional appliance</span>
//                             <span className="font-bold text-green-800">+${serviceInfo.additionalPrice}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Who is my pro? */}
//                     <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
//                       <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
//                         <span className="text-xl mr-2">👨‍🔧</span>
//                         Who is my pro?
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         WorkOnTap will match you with certified, background-checked pros in your area once you submit your job. You'll see their profile, ratings, and reviews before accepting.
//                       </p>
//                     </div>

//                     {/* Trust badge */}
//                     <div className="mt-5 pt-5 border-t border-gray-200">
//                       <div className="flex items-center text-xs text-gray-500">
//                         <svg className="w-4 h-4 text-green-600 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         <span>You won't be charged until the job is complete</span>
//                       </div>
//                       <div className="flex items-center text-xs text-gray-500 mt-2">
//                         <svg className="w-4 h-4 text-green-600 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                         <span>Free cancellation up to 24 hours before</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Support Card */}
//                 <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
//                   <div className="flex items-start space-x-4">
//                     <div className="text-3xl">💬</div>
//                     <div>
//                       <h4 className="font-bold text-lg mb-1">Questions?</h4>
//                       <p className="text-green-100 text-sm mb-3">
//                         Not sure what to write? Our team can help.
//                       </p>
//                       <Link href="/chat" className="inline-flex items-center bg-white text-green-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-md">
//                         Chat with us
//                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== SIMPLE FOOTER ===== */}
//       <footer className="bg-white border-t border-gray-200 mt-16 py-8">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
//             <div className="flex items-center space-x-4">
//               <Link href="/" className="text-green-800 font-extrabold text-lg">WorkOnTap</Link>
//               <span>© 2026</span>
//             </div>
//             <div className="flex space-x-6 mt-4 md:mt-0">
//               <Link href="/terms" className="hover:text-green-700 transition">Terms</Link>
//               <Link href="/privacy" className="hover:text-green-700 transition">Privacy</Link>
//               <Link href="/guarantee" className="hover:text-green-700 transition">Guarantee</Link>
//               <Link href="/help" className="hover:text-green-700 transition">Help</Link>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Animation styles */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }





// app/booking/details/page.js
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function BookingDetailsPage() {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [parkingAccess, setParkingAccess] = useState(false);
  const [elevatorAccess, setElevatorAccess] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const fileInputRef = useRef(null);

  const maxDescriptionLength = 500;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxPhotos = 5;

  // Get schedule data from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('bookingSchedule');
    if (saved) {
      setScheduleData(JSON.parse(saved));
    } else {
      router.push('/services');
    }
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');

    // Check total photos limit
    if (photos.length + files.length > maxPhotos) {
      setUploadError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    // Validate each file before upload
    for (let file of files) {
      if (file.size > maxFileSize) {
        setUploadError('Some files exceed the 10MB limit');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload only image files');
        return;
      }
    }

    setUploading(true);

    // Upload each file
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.success) {
          return data.url;
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Upload error:', error);
        return null;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      setPhotos([...photos, ...validUrls]);
      
      if (validUrls.length < files.length) {
        setUploadError('Some photos failed to upload');
      }
    } catch (error) {
      setUploadError('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const handleContinue = () => {
    // Save details data to session storage
    const detailsData = {
      job_description: jobDescription,
      instructions: '',
      parking_access: parkingAccess,
      elevator_access: elevatorAccess,
      has_pets: hasPets,
      photos: photos  // Now these are actual URLs, not object URLs
    };
    
    sessionStorage.setItem('bookingDetails', JSON.stringify(detailsData));
    router.push('/booking/confirm');
  };

  if (!scheduleData) {
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
      <Header/>

      {/* Breadcrumbs */}
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
            <span className="text-gray-900 font-medium">Job Details</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Progress Tracker */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 2 OF 3</span>
              <span className="text-sm text-gray-500 font-medium">Tell us about your job</span>
            </div>
            <div className="relative">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '66%'}}></div>
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
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">3</div>
                    <span className="ml-2 text-sm text-gray-500">Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Tell us about your job
          </h1>
          <p className="text-lg text-gray-600 mb-8 md:mb-10">
            The more details you provide, the better pros can quote you
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Job Description Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">📝</span>
                    What do you need done?
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    Be specific — include make/model if possible
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value.slice(0, maxDescriptionLength))}
                    placeholder="e.g. My Whirlpool dishwasher (model WDF540PADM) is not draining. It makes a humming sound but water stays at the bottom. Need someone to diagnose and repair."
                    className="w-full h-40 md:h-48 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-700 placeholder:text-gray-400 text-base"
                  />
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Include details like: issue, make/model, when it started
                    </div>
                    <span className={`text-xs font-medium ${jobDescription.length >= maxDescriptionLength ? 'text-red-600' : 'text-gray-500'}`}>
                      {jobDescription.length}/{maxDescriptionLength}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Upload Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">📸</span>
                    Upload photos
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    Show pros exactly what needs to be done
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  {/* Upload error message */}
                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {uploadError}
                    </div>
                  )}

                  {/* Photo grid */}
                  {photos.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-green-500 transition">
                            <img 
                              src={photo} 
                              alt={`Upload ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removePhoto(index)}
                                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition"
                                aria-label="Remove photo"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload area */}
                  {photos.length < maxPhotos ? (
                    <label className={`
                      border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer
                      transition-all duration-200
                      ${photos.length === 0 
                        ? 'border-gray-300 hover:border-green-500 hover:bg-green-50/30' 
                        : 'border-green-300 bg-green-50/20 hover:bg-green-50/50'
                      }
                      ${uploading ? 'opacity-50 cursor-wait' : ''}
                    `}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center mb-3
                        ${photos.length === 0 ? 'bg-green-100' : 'bg-green-200'}
                      `}>
                        {uploading ? (
                          <svg className="animate-spin w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className={`w-8 h-8 ${photos.length === 0 ? 'text-green-700' : 'text-green-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <span className="text-green-700 font-bold text-lg mb-1">
                        {uploading ? 'Uploading...' : (photos.length === 0 ? 'Add Photos' : 'Add More Photos')}
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </span>
                      <span className="text-xs text-gray-400 mt-2">
                        {photos.length}/{maxPhotos} photos uploaded
                      </span>
                    </label>
                  ) : (
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                      <span className="text-green-700 font-semibold">✓ Maximum photos uploaded</span>
                      <p className="text-xs text-gray-600 mt-1">You've added {maxPhotos} photos</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-4 flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Photos help pros give more accurate quotes
                  </p>
                </div>
              </div>

              {/* Access & Safety Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">🔑</span>
                    Access & safety (optional)
                  </h2>
                </div>
                
                <div className="p-6 md:p-8">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="parking"
                          type="checkbox"
                          checked={parkingAccess}
                          onChange={(e) => setParkingAccess(e.target.checked)}
                          className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="parking" className="font-medium text-gray-700">Free street parking available</label>
                        <p className="text-xs text-gray-500">Let pros know they can park without permits</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="elevator"
                          type="checkbox"
                          checked={elevatorAccess}
                          onChange={(e) => setElevatorAccess(e.target.checked)}
                          className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="elevator" className="font-medium text-gray-700">Building has elevator</label>
                        <p className="text-xs text-gray-500">For apartments/condos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="pets"
                          type="checkbox"
                          checked={hasPets}
                          onChange={(e) => setHasPets(e.target.checked)}
                          className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="pets" className="font-medium text-gray-700">I have pets</label>
                        <p className="text-xs text-gray-500">Pros will take extra care when entering</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <Link href="/booking/schedule" className="sm:order-1">
                  <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition font-medium text-gray-700 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                </Link>
                
                <button 
                  onClick={handleContinue}
                  disabled={jobDescription.length < 20 || uploading}
                  className={`
                    w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg
                    flex items-center justify-center transition-all duration-300
                    ${jobDescription.length >= 20 && !uploading
                      ? 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {uploading ? 'Uploading...' : 'Continue to review'}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              
              {jobDescription.length < 20 && jobDescription.length > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please write at least 20 characters to help pros understand your job
                </p>
              )}
              
              {jobDescription.length === 0 && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Describe your job to continue
                </p>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">📋</span>
                      Booking summary
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start space-x-3 mb-5 pb-5 border-b border-gray-200">
                      <div className="bg-green-100 rounded-xl p-3">
                        <span className="text-2xl">🔌</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{scheduleData.service_name}</h4>
                      </div>
                    </div>

                    <div className="mb-5 pb-5 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Your schedule
                      </h4>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(scheduleData.job_date)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
                            {scheduleData.job_time_slot === 'morning' && '🌅'}
                            {scheduleData.job_time_slot === 'afternoon' && '☀️'}
                            {scheduleData.job_time_slot === 'evening' && '🌙'}
                            <span className="ml-1">{scheduleData.job_time_slot}</span>
                          </span>
                        </div>
                      </div>
                      <Link href="/booking/schedule" className="text-xs text-green-700 hover:text-green-800 font-medium mt-2 inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.038-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Edit schedule
                      </Link>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="text-center">
                        <div className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting at</div>
                        <div className="text-3xl md:text-4xl font-extrabold text-green-800">
                          ${parseFloat(scheduleData.service_price).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">For the first appointment</div>
                        {scheduleData.additional_price > 0 && (
                          <>
                            <div className="border-t border-green-200 my-3"></div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Additional</span>
                              <span className="font-bold text-green-800">+${parseFloat(scheduleData.additional_price).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="text-xl mr-2">👨‍🔧</span>
                          Who is my pro?
                        </h4>
                        <p className="text-sm text-gray-600">
                          WorkOnTap will match you with certified, background-checked pros in your area once you submit your job.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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