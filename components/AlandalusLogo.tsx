import React from 'react';

interface AlandalusLogoProps {
  className?: string;
  variant?: 'compact' | 'full';
  color?: string;
}

export const AlandalusLogo: React.FC<AlandalusLogoProps> = ({ 
  className = "", 
  variant = 'full',
  color = 'text-blue-900 dark:text-blue-100'
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Stylized Alandalus Monogram / Emblem */}
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer elegant education shield / crescent shape */}
          <path d="M50 5C25.147 5 5 25.147 5 50C5 67.5 15 82.5 30 90C35 92.5 40 95 50 95C60 95 65 92.5 70 90C85 82.5 95 67.5 95 50C95 25.147 74.853 5 50 5Z" fill="url(#andalus-grad)" className="opacity-10 dark:opacity-20" />
          {/* Inner Calligraphic Core SVG representation of "A" / Crescent */}
          <path d="M50 15C30.67 15 15 30.67 15 50C15 65.5 25 78.5 38.5 83.5C39.5 84 40.5 83 40.5 82V65C40.5 63 42 61.5 44 61.5H56C58 61.5 59.5 63 59.5 65V82C59.5 83 60.5 84 61.5 83.5C75 78.5 85 65.5 85 50C85 30.67 69.33 15 50 15Z" fill="currentColor" className="fill-blue-500 dark:fill-blue-400" />
          <path d="M50 22C34.54 22 22 34.54 22 50C22 59.5 27 68 34.5 73C35.5 73.5 36.5 72.5 36.5 71.5V58C36.5 56 38 54.5 40 54.5H60C62 54.5 63.5 56 63.5 58V71.5C63.5 72.5 64.5 73.5 65.5 73C73 68 78 59.5 78 50C78 34.54 65.46 22 50 22Z" fill="currentColor" className="fill-orange-400" />
          <circle cx="50" cy="42" r="8" fill="currentColor" className="fill-blue-600 dark:fill-blue-300" />
          <defs>
            <linearGradient id="andalus-grad" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a] dark:text-[#60a5fa] mt-1 font-sans">
          ALANDALUS
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center font-sans tracking-tight text-right ${className}`}>
      {/* Upper Half: Brand Core Title */}
      <div className="flex flex-col items-center justify-center space-y-1 select-none">
        {/* Custom Modern Calligraphic Styled Text */}
        <h2 className="text-3xl md:text-4xl font-black tracking-normal text-[#1a365d] dark:text-[#93c5fd] font-sans" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          الأندلس
        </h2>
        {/* Latin Subtitle Style */}
        <h3 className="text-xs md:text-sm font-extrabold tracking-[0.25em] text-[#1e3a8a] dark:text-[#60a5fa] uppercase font-mono">
          ALANDALUS
        </h3>
      </div>

      {/* Elegant Separator Line */}
      <div className="w-full max-w-[200px] border-t border-slate-200 dark:border-slate-800 my-2.5"></div>

      {/* Lower Half: Full Corporate Text */}
      <div className="flex flex-col items-center justify-center space-y-0.5 text-center select-none">
        <span className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          شركة الأندلس التعليمية
        </span>
        <span className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans tracking-tight">
          Alandalus Educational Company
        </span>
      </div>
    </div>
  );
};
