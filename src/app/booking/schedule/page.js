// // app/booking/schedule/page.js - Booking Schedule Page
// // ✅ WorkOnTap green theme — consistent with homepage & service pages
// // ✅ All Jiffy references removed — pure WorkOnTap branding
// // ✅ Fully responsive — mobile, tablet, desktop optimized
// // ✅ Modern calendar & time slot selection
// // ✅ Mobile menu toggle included
// // ✅ Progress tracker with green theme

// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';

// export default function BookingSchedulePage() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState(['afternoon']);
//   const [timingConstraints, setTimingConstraints] = useState('');
//   const [currentMonth, setCurrentMonth] = useState(2); // February
//   const [currentYear, setCurrentYear] = useState(2026);
//   const [showCalendar, setShowCalendar] = useState(true);

//   const timeSlots = [
//     { id: 'morning', label: 'Morning', icon: '🌅', time: '8am - 12pm' },
//     { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12pm - 4pm' },
//     { id: 'evening', label: 'Evening', icon: '🌙', time: '4pm - 8pm' }
//   ];

//   const toggleTimeSlot = (slot) => {
//     if (selectedTimes.includes(slot)) {
//       setSelectedTimes(selectedTimes.filter(s => s !== slot));
//     } else {
//       setSelectedTimes([...selectedTimes, slot]);
//     }
//   };

//   const removeSelectedDate = () => {
//     setSelectedDate(null);
//     setSelectedTimes([]);
//   };

//   // Calendar data generator
//   const generateCalendarDays = () => {
//     // February 2026 starts on Sunday (0)
//     const daysInMonth = 28;
//     const startDay = 0; // Sunday
//     const days = [];
    
//     // Empty cells for days before month starts
//     for (let i = 0; i < startDay; i++) {
//       days.push({ day: null, available: false });
//     }
    
//     // Actual days of the month
//     for (let i = 1; i <= daysInMonth; i++) {
//       // Make all days available except some random ones for demo
//       const available = ![5, 12, 19, 26].includes(i); // Some Sundays blocked
//       days.push({ 
//         day: i, 
//         available, 
//         highlighted: i === 16 || i === selectedDate // 16th is highlighted as example
//       });
//     }
    
//     return days;
//   };

//   const calendarDays = generateCalendarDays();
  
//   // Weekday headers
//   const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const handlePreviousMonth = () => {
//     if (currentMonth > 1) {
//       setCurrentMonth(currentMonth - 1);
//     } else {
//       setCurrentMonth(12);
//       setCurrentYear(currentYear - 1);
//     }
//     setSelectedDate(null);
//   };

//   const handleNextMonth = () => {
//     if (currentMonth < 12) {
//       setCurrentMonth(currentMonth + 1);
//     } else {
//       setCurrentMonth(1);
//       setCurrentYear(currentYear + 1);
//     }
//     setSelectedDate(null);
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   // Service data (would come from context/state in real app)
//   const serviceInfo = {
//     name: 'Appliance Install',
//     price: 180,
//     additionalPrice: 90,
//     location: '123 B Avenue Southwest, Calgary AB'
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//       <Header/>
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
//             <span className="text-gray-900 font-medium">Schedule</span>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8 md:py-12">
//         <div className="max-w-6xl mx-auto">
          
//           {/* ===== PROGRESS TRACKER – Green theme ===== */}
//           <div className="mb-10 md:mb-12">
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 1 OF 3</span>
//               <span className="text-sm text-gray-500 font-medium">Book in under 2 minutes</span>
//             </div>
//             <div className="relative">
//               <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '33%'}}></div>
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
//                     <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">2</div>
//                     <span className="ml-2 text-sm text-gray-500">Details</span>
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
//             Book {serviceInfo.name}
//           </h1>
//           <p className="text-lg text-gray-600 mb-8 md:mb-10">
//             Select a date and time that works for you
//           </p>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//             {/* ===== MAIN FORM - LEFT COLUMN ===== */}
//             <div className="lg:col-span-2 space-y-8">
              
//               {/* ===== DATE SELECTION CARD ===== */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">📅</span>
//                     When should we send someone?
//                   </h2>
//                   <p className="text-green-100 text-sm mt-1 ml-1">
//                     Select available date and times — pros in your area are ready
//                   </p>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   {/* Calendar Header */}
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-xl font-bold text-gray-800">
//                       {monthNames[currentMonth - 1]} {currentYear}
//                     </h3>
//                     <div className="flex gap-2">
//                       <button 
//                         onClick={handlePreviousMonth}
//                         className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition border border-gray-300"
//                         aria-label="Previous month"
//                       >
//                         <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                         </svg>
//                       </button>
//                       <button 
//                         onClick={handleNextMonth}
//                         className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition border border-gray-300"
//                         aria-label="Next month"
//                       >
//                         <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>

//                   {/* Weekday Headers */}
//                   <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
//                     {weekdays.map((day, index) => (
//                       <div key={index} className="text-center text-xs md:text-sm font-semibold text-gray-500 py-2">
//                         {day}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Calendar Grid */}
//                   <div className="grid grid-cols-7 gap-1 md:gap-2">
//                     {calendarDays.map((day, index) => (
//                       <div key={index} className="aspect-square">
//                         {day.day ? (
//                           <button
//                             onClick={() => day.available && setSelectedDate(day.day)}
//                             disabled={!day.available}
//                             className={`
//                               w-full h-full rounded-xl flex items-center justify-center text-sm md:text-base font-medium
//                               transition-all duration-200
//                               ${selectedDate === day.day 
//                                 ? 'bg-gradient-to-br from-green-700 to-green-600 text-white shadow-md scale-105' 
//                                 : day.highlighted && !selectedDate
//                                   ? 'bg-green-100 text-green-800 border-2 border-green-300'
//                                   : day.available
//                                     ? 'hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-green-400'
//                                     : 'text-gray-300 bg-gray-50 cursor-not-allowed border border-gray-100'
//                               }
//                             `}
//                           >
//                             {day.day}
//                           </button>
//                         ) : (
//                           <div className="w-full h-full"></div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Legend */}
//                   <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-gradient-to-br from-green-700 to-green-600 rounded-full mr-2"></div>
//                       <span className="text-xs text-gray-600">Selected</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-full mr-2"></div>
//                       <span className="text-xs text-gray-600">Recommended</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 border border-gray-200 bg-white rounded-full mr-2"></div>
//                       <span className="text-xs text-gray-600">Available</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded-full mr-2"></div>
//                       <span className="text-xs text-gray-600">Unavailable</span>
//                     </div>
//                   </div>

//                   {/* Time Slots */}
//                   <div className="mt-8">
//                     <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
//                       <span className="mr-2">⏰</span>
//                       Select your preferred times
//                     </h4>
//                     <p className="text-sm text-gray-600 mb-4">
//                       Choose all time slots that work for you — we'll match you with available pros
//                     </p>
                    
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                       {timeSlots.map((slot) => (
//                         <button
//                           key={slot.id}
//                           onClick={() => toggleTimeSlot(slot.id)}
//                           className={`
//                             p-4 rounded-xl border-2 transition-all duration-200
//                             ${selectedTimes.includes(slot.id)
//                               ? 'bg-gradient-to-br from-green-700 to-green-600 border-green-700 text-white shadow-md scale-[1.02]'
//                               : 'bg-white border-gray-200 hover:border-green-500 hover:bg-green-50/50 text-gray-800'
//                             }
//                           `}
//                         >
//                           <div className="flex flex-col items-center">
//                             <span className="text-2xl mb-1">{slot.icon}</span>
//                             <span className="font-bold text-base">{slot.label}</span>
//                             <span className={`text-xs mt-1 ${selectedTimes.includes(slot.id) ? 'text-green-100' : 'text-gray-500'}`}>
//                               {slot.time}
//                             </span>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Selected Date Display */}
//                   {selectedDate && selectedTimes.length > 0 && (
//                     <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div className="bg-green-700 text-white p-2 rounded-lg">
//                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                             </svg>
//                           </div>
//                           <div>
//                             <span className="text-sm font-medium text-gray-700">Selected date & time</span>
//                             <div className="flex items-center flex-wrap gap-2 mt-1">
//                               <span className="text-base font-bold text-gray-900">
//                                 {monthNames[currentMonth - 1]} {selectedDate}, {currentYear}
//                               </span>
//                               {selectedTimes.map(time => (
//                                 <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize">
//                                   {time}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={removeSelectedDate}
//                           className="text-gray-500 hover:text-red-600 transition p-2"
//                           aria-label="Clear selection"
//                         >
//                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Add Another Date Button */}
//                   <button 
//                     onClick={() => setShowCalendar(true)}
//                     className="mt-6 text-green-700 hover:text-green-800 font-medium flex items-center space-x-2 transition group"
//                   >
//                     <svg className="w-5 h-5 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>Add another date</span>
//                   </button>
//                 </div>
//               </div>

//               {/* ===== TIMING CONSTRAINTS CARD ===== */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">⏳</span>
//                     Timing constraints
//                   </h2>
//                   <p className="text-green-100 text-sm mt-1 ml-1">
//                     Let your pro know about any specific timing needs
//                   </p>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   <textarea
//                     value={timingConstraints}
//                     onChange={(e) => setTimingConstraints(e.target.value)}
//                     placeholder="e.g. Baby is napping from 3-4pm. Please do not arrive during those times. / Please call 30 minutes before arrival. / Building has limited parking — instructions sent via chat."
//                     className="w-full h-32 md:h-40 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-700 placeholder:text-gray-400 text-base"
//                   />
//                   <p className="text-xs text-gray-500 mt-3 flex items-center">
//                     <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                     </svg>
//                     Your pro will see these notes before accepting the job
//                   </p>
//                 </div>
//               </div>

//               {/* ===== NAVIGATION BUTTONS ===== */}
//               <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
//                 <Link href="/services/appliance-install" className="sm:order-1">
//                   <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition font-medium text-gray-700 flex items-center justify-center">
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                     Back
//                   </button>
//                 </Link>
                
//                 <Link 
//                   href={selectedDate && selectedTimes.length > 0 ? "/booking/details" : "#"} 
//                   className="sm:order-2"
//                 >
//                   <button 
//                     disabled={!selectedDate || selectedTimes.length === 0}
//                     className={`
//                       w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg
//                       flex items-center justify-center transition-all duration-300
//                       ${selectedDate && selectedTimes.length > 0
//                         ? 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200' 
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }
//                     `}
//                   >
//                     Continue
//                     <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                     </svg>
//                   </button>
//                 </Link>
//               </div>
              
//               {(!selectedDate || selectedTimes.length === 0) && (
//                 <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center">
//                   <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   Please select a date and at least one time slot to continue
//                 </p>
//               )}
//             </div>

//             {/* ===== SIDEBAR - RIGHT COLUMN ===== */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24">
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
//                         <span className="text-2xl">🔌</span>
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

//                     {/* Selected Date/Time Preview */}
//                     {selectedDate && selectedTimes.length > 0 ? (
//                       <div className="mb-5 pb-5 border-b border-gray-200">
//                         <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
//                           <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                           </svg>
//                           Your selection
//                         </h4>
//                         <div className="bg-gray-50 rounded-lg p-3">
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm font-medium text-gray-700">
//                               {monthNames[currentMonth - 1]} {selectedDate}, {currentYear}
//                             </span>
//                           </div>
//                           <div className="flex flex-wrap gap-2 mt-2">
//                             {selectedTimes.map(time => (
//                               <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
//                                 {time === 'morning' && '🌅'}
//                                 {time === 'afternoon' && '☀️'}
//                                 {time === 'evening' && '🌙'}
//                                 <span className="ml-1">{time}</span>
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="mb-5 pb-5 border-b border-gray-200">
//                         <div className="bg-amber-50 rounded-lg p-4 text-center">
//                           <span className="text-2xl mb-2 block">📅</span>
//                           <p className="text-sm text-amber-800">No date selected yet</p>
//                           <p className="text-xs text-amber-600 mt-1">Please choose a date and time to continue</p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Trust Message */}
//                     <div className="text-xs text-gray-600 space-y-2">
//                       <div className="flex items-start">
//                         <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                         </svg>
//                         <span>You won't be charged until the job is complete</span>
//                       </div>
//                       <div className="flex items-start">
//                         <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                         <span>Free cancellation up to 24 hours before</span>
//                       </div>
//                     </div>

//                     {/* Additional Info */}
//                     <div className="mt-5 pt-5 border-t border-gray-200">
//                       <button className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center transition group w-full justify-center">
//                         <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                         </svg>
//                         <Link href="/pricing">Pricing details & terms</Link>
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Support Card */}
//                 <div className="mt-6 bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
//                   <div className="flex items-start space-x-4">
//                     <div className="text-3xl">💬</div>
//                     <div>
//                       <h4 className="font-bold text-lg mb-1">Need help?</h4>
//                       <p className="text-green-100 text-sm mb-3">
//                         Our support team is here to help you book the right service.
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
















// app/booking/schedule/page.js (full file with fixes)
'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

function BookingScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [timingConstraints, setTimingConstraints] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch service details
  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services?id=${serviceId}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Check if data.data is array or object
        if (Array.isArray(data.data)) {
          setService(data.data[0]);
        } else {
          setService(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component code...
  // (timeSlots, toggleTimeSlot, calendar functions, etc.)
  const timeSlots = [
    { id: 'morning', label: 'Morning', icon: '🌅', time: '8am - 12pm' },
    { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12pm - 4pm' },
    { id: 'evening', label: 'Evening', icon: '🌙', time: '4pm - 8pm' }
  ];

  const toggleTimeSlot = (slot) => {
    if (selectedTimes.includes(slot)) {
      setSelectedTimes(selectedTimes.filter(s => s !== slot));
    } else {
      setSelectedTimes([...selectedTimes, slot]);
    }
  };

  const removeSelectedDate = () => {
    setSelectedDate(null);
    setSelectedTimes([]);
  };

  // Calendar functions
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, available: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const today = new Date();
      const isPast = new Date(currentYear, currentMonth - 1, i) < new Date(today.setHours(0,0,0,0));
      days.push({ 
        day: i, 
        available: !isPast,
        highlighted: i === 16
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePreviousMonth = () => {
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1);
    } else {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1);
    } else {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    }
    setSelectedDate(null);
  };

  const handleContinue = () => {
    // Save schedule data to session storage
    const scheduleData = {
      service_id: service.id,
      service_name: service.name,
      service_price: service.base_price,
      additional_price: service.additional_price,
      job_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`,
      job_time_slot: selectedTimes[0], // For now, just first selected
      timing_constraints: timingConstraints
    };
    
    sessionStorage.setItem('bookingSchedule', JSON.stringify(scheduleData));
    router.push('/booking/details');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Service not found</h2>
          <Link href="/services" className="text-green-700 hover:underline">
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header/>
      
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700 transition">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-green-700 transition">Services</Link>
            <span className="mx-2">›</span>
            <Link href={`/services/${service.slug}`} className="hover:text-green-700 transition">{service.name}</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Schedule</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Progress Tracker */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 1 OF 3</span>
              <span className="text-sm text-gray-500 font-medium">Book in under 2 minutes</span>
            </div>
            <div className="relative">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '33%'}}></div>
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
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">2</div>
                    <span className="ml-2 text-sm text-gray-500">Details</span>
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
            Book {service.name}
          </h1>
          <p className="text-lg text-gray-600 mb-8 md:mb-10">
            Select a date and time that works for you
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Date Selection Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">📅</span>
                    When should we send someone?
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    Select available date and times — pros in your area are ready
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      {monthNames[currentMonth - 1]} {currentYear}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={handlePreviousMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition border border-gray-300">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={handleNextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition border border-gray-300">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    {weekdays.map((day, index) => (
                      <div key={index} className="text-center text-xs md:text-sm font-semibold text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="aspect-square">
                        {day.day ? (
                          <button
                            onClick={() => day.available && setSelectedDate(day.day)}
                            disabled={!day.available}
                            className={`
                              w-full h-full rounded-xl flex items-center justify-center text-sm md:text-base font-medium
                              transition-all duration-200
                              ${selectedDate === day.day 
                                ? 'bg-gradient-to-br from-green-700 to-green-600 text-white shadow-md scale-105' 
                                : day.available
                                  ? 'hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-green-400'
                                  : 'text-gray-300 bg-gray-50 cursor-not-allowed border border-gray-100'
                              }
                            `}
                          >
                            {day.day}
                          </button>
                        ) : (
                          <div className="w-full h-full"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">⏰</span>
                      Select your preferred times
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose all time slots that work for you — we&apos;ll match you with available pros
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => toggleTimeSlot(slot.id)}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-200
                            ${selectedTimes.includes(slot.id)
                              ? 'bg-gradient-to-br from-green-700 to-green-600 border-green-700 text-white shadow-md scale-[1.02]'
                              : 'bg-white border-gray-200 hover:border-green-500 hover:bg-green-50/50 text-gray-800'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-2xl mb-1">{slot.icon}</span>
                            <span className="font-bold text-base">{slot.label}</span>
                            <span className={`text-xs mt-1 ${selectedTimes.includes(slot.id) ? 'text-green-100' : 'text-gray-500'}`}>
                              {slot.time}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Constraints Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">⏳</span>
                    Timing constraints
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    Let your pro know about any specific timing needs
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  <textarea
                    value={timingConstraints}
                    onChange={(e) => setTimingConstraints(e.target.value)}
                    placeholder="e.g. Baby is napping from 3-4pm. Please do not arrive during those times. / Please call 30 minutes before arrival. / Building has limited parking — instructions sent via chat."
                    className="w-full h-32 md:h-40 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-700 placeholder:text-gray-400 text-base"
                  />
                  <p className="text-xs text-gray-500 mt-3 flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Your pro will see these notes before accepting the job
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <Link href={`/services/${service.slug}`} className="sm:order-1">
                  <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition font-medium text-gray-700 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                </Link>
                
                <button 
                  onClick={handleContinue}
                  disabled={!selectedDate || selectedTimes.length === 0}
                  className={`
                    w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg
                    flex items-center justify-center transition-all duration-300
                    ${selectedDate && selectedTimes.length > 0
                      ? 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Continue
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              
              {(!selectedDate || selectedTimes.length === 0) && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please select a date and at least one time slot to continue
                </p>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
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
                        <h4 className="font-bold text-gray-900">{service.name}</h4>
                      </div>
                    </div>

                    <div className="mb-5 pb-5 border-b border-gray-200">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-center">
                          <div className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting at</div>
                          <div className="text-3xl md:text-4xl font-extrabold text-green-800">
                            ${parseFloat(service.base_price).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">For the first appointment</div>
                          {service.additional_price > 0 && (
                            <>
                              <div className="border-t border-green-200 my-3"></div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">Additional</span>
                                <span className="font-bold text-green-800">+${parseFloat(service.additional_price).toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedDate && selectedTimes.length > 0 ? (
                      <div className="mb-5 pb-5 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Your selection
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {monthNames[currentMonth - 1]} {selectedDate}, {currentYear}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedTimes.map(time => (
                              <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
                                {time === 'morning' && '🌅'}
                                {time === 'afternoon' && '☀️'}
                                {time === 'evening' && '🌙'}
                                <span className="ml-1">{time}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5 pb-5 border-b border-gray-200">
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                          <span className="text-2xl mb-2 block">📅</span>
                          <p className="text-sm text-amber-800">No date selected yet</p>
                          <p className="text-xs text-amber-600 mt-1">Please choose a date and time to continue</p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-600 space-y-2">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>You won&apos;t be charged until the job is complete</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Free cancellation up to 24 hours before</span>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Suspense wrapper for the schedule page
export default function BookingSchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingScheduleContent />
    </Suspense>
  );
}