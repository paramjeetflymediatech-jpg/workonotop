'use client';

import { useState, useEffect } from 'react';

export default function TypingHero({ phrases = [] }) {
  const [heroText, setHeroText] = useState('');
  const [isDeletingHero, setIsDeletingHero] = useState(false);
  const [loopNumHero, setLoopNumHero] = useState(0);
  const [typingSpeedHero, setTypingSpeedHero] = useState(100);

  useEffect(() => {
    if (!phrases.length) return;

    let timer;
    const handleTyping = () => {
      const i = loopNumHero % phrases.length;
      const fullText = phrases[i];
      
      if (!isDeletingHero) {
        setHeroText(fullText.substring(0, heroText.length + 1));
        setTypingSpeedHero(80);
      } else {
        setHeroText(fullText.substring(0, heroText.length - 1));
        setTypingSpeedHero(40);
      }

      if (!isDeletingHero && heroText === fullText) {
        setTimeout(() => setIsDeletingHero(true), 2000);
      } else if (isDeletingHero && heroText === '') {
        setIsDeletingHero(false);
        setLoopNumHero(loopNumHero + 1);
        setTypingSpeedHero(80);
      }
    };

    timer = setTimeout(handleTyping, typingSpeedHero);
    return () => clearTimeout(timer);
  }, [heroText, isDeletingHero, loopNumHero, typingSpeedHero, phrases]);

  return (
    <span className="text-transparent bg-clip-text bg-[#15803D]">
      {heroText || '\u00A0'}
    </span>
  );
}
