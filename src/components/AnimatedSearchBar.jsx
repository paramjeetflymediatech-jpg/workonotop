'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnimatedSearchBar({ services = [] }) {
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // Typing Effect for Placeholder
  useEffect(() => {
    if (!services.length) return;

    let timer;
    const handleTyping = () => {
      const i = loopNum % services.length;
      const fullText = services[i];
      
      if (!isDeleting) {
        setPlaceholder(fullText.substring(0, placeholder.length + 1));
        setTypingSpeed(80);
      } else {
        setPlaceholder(fullText.substring(0, placeholder.length - 1));
        setTypingSpeed(40);
      }

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(80);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed, services]);

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/services');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  return (
    <div className="relative max-w-2xl lg:mx-0 mx-auto group">
      {/* Glow Border */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-700"
        style={{ background: "linear-gradient(90deg, #15803D, #22c55e)" }}
      ></div>

      {/* Main Box */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center hover:bg-white/15 transition-all duration-300">
        
        {/* Input Area */}
        <div className="flex items-center flex-1 px-4 py-3">
          {/* Icon */}
          <svg
            className="w-6 h-6 mr-3"
            style={{ color: "#15803D" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Input */}
          <input
            type="text"
            placeholder={placeholder || 'What do you need fixed?'}
            className="w-full bg-transparent border-none outline-none text-black placeholder:text-black text-lg md:text-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSearchClick}
          className="font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl transition-all active:scale-95 text-sm sm:text-base mr-2 sm:mr-0"
          style={{
            backgroundColor: "#15803D",
            color: "#ECFDF5",
            boxShadow: "0 10px 25px rgba(21, 128, 61, 0.4)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#166534"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#15803D"}
        >
          Search
        </button>
      </div>
    </div>
  );
}
