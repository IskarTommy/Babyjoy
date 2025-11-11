import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo SVG - Playful kids design with stars and hearts */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="18" fill="#FF6B9D" opacity="0.2"/>
        
        {/* Main star shape */}
        <path 
          d="M20 8L22.5 15.5L30 18L22.5 20.5L20 28L17.5 20.5L10 18L17.5 15.5L20 8Z" 
          fill="#FF6B9D"
        />
        
        {/* Small hearts */}
        <path 
          d="M12 12C12 11 11 10 10 10C9 10 8 11 8 12C8 13 9 14 10 15L12 13C12 13 12 12 12 12Z" 
          fill="#FFB6C1"
        />
        <path 
          d="M32 12C32 11 31 10 30 10C29 10 28 11 28 12C28 13 29 14 30 15L32 13C32 13 32 12 32 12Z" 
          fill="#FFB6C1"
        />
        
        {/* Small stars */}
        <circle cx="14" cy="26" r="1.5" fill="#FFC0CB"/>
        <circle cx="26" cy="26" r="1.5" fill="#FFC0CB"/>
        <circle cx="20" cy="32" r="1.5" fill="#FFC0CB"/>
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Hafshat
          </span>
          <span className="text-sm font-semibold text-purple-600 -mt-1">
            Kidz
          </span>
        </div>
      )}
    </div>
  );
};
