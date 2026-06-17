import React from 'react';

interface AlandalusLogoProps {
  className?: string;
  variant?: 'compact' | 'full';
  color?: string;
}

export const AlandalusLogo: React.FC<AlandalusLogoProps> = ({ 
  className = "", 
  variant = 'full',
  color = ''
}) => {
  const brandTextColor = color || "text-[#213063] dark:text-blue-100";
  const brandSubColor = "text-[#213063] dark:text-blue-200";
  const brandMutedColor = "text-slate-500 dark:text-slate-400";
  
  if (variant === 'compact') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Compact elegant representation of the official logo */}
        <div className="flex flex-col items-center justify-center space-y-0.5">
          <span 
            className={`text-xl md:text-2xl font-black tracking-normal leading-none ${brandTextColor}`}
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            الأندلس
          </span>
          <span className={`text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase font-sans ${brandSubColor}`}>
            ALANDALUS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Official Alandalus Educational Company logo layout */}
      <div className="flex flex-col items-center justify-center space-y-1">
        <h2 
          className={`text-3xl md:text-4xl font-black tracking-normal leading-none ${brandTextColor}`}
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          الأندلس
        </h2>
        <h3 className={`text-xs md:text-sm font-black tracking-[0.25em] font-sans ${brandSubColor}`}>
          ALANDALUS
        </h3>
      </div>

      {/* Elegant thin horizontal separator line precisely matching the logo */}
      <div className="w-full max-w-[160px] md:max-w-[200px] border-t border-slate-300 dark:border-slate-700 my-2 md:my-3"></div>

      <div className="flex flex-col items-center justify-center space-y-0.5 md:space-y-1 text-center">
        <span 
          className={`text-xs md:text-sm font-bold tracking-wide ${brandTextColor}`}
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          شركة الأندلس التعليمية
        </span>
        <span className={`text-[10px] md:text-xs font-semibold tracking-normal font-sans ${brandMutedColor}`}>
          Alandalus Educational Company
        </span>
      </div>
    </div>
  );
};
