import React, { useState, useCallback, useEffect } from 'react';

interface WoodenFishProps {
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
  externalTrigger?: number;
  isGolden?: boolean;
}

export const WoodenFish: React.FC<WoodenFishProps> = ({ onClick, externalTrigger = 0, isGolden = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when externalTrigger changes
  useEffect(() => {
    if (externalTrigger > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 120);
      return () => clearTimeout(timer);
    }
  }, [externalTrigger]);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsAnimating(true);
    onClick(e);
    
    // Reset animation class
    setTimeout(() => setIsAnimating(false), 120);
  }, [onClick]);

  return (
    <div 
      className={`relative w-72 h-72 md:w-96 md:h-96 cursor-pointer transition-transform duration-100 ease-out select-none ${isAnimating ? 'scale-95' : 'scale-100'}`}
      onMouseDown={handleClick}
      onTouchStart={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Tap wooden fish"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Glow effect for Golden Fish */}
      {isGolden && (
        <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 blur-3xl animate-pulse pointer-events-none" />
      )}

      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl relative z-10"
      >
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
            <feOffset dx="5" dy="15" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Standard Wood Gradient */}
          <linearGradient id="stickGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5d4037" />
            <stop offset="100%" stopColor="#3e2723" />
          </linearGradient>

          {/* Golden Gradient */}
          <linearGradient id="goldBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFECB3" />
            <stop offset="40%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#FF6F00" />
          </linearGradient>
          
          <linearGradient id="goldStickGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>

        <g filter="url(#softShadow)">
          {/* Main Body */}
          <path
            d="M200,360 C100,360 40,280 40,190 C40,110 90,50 180,50 C280,50 360,120 360,210 C360,300 290,360 200,360 Z"
            fill={isGolden ? "url(#goldBodyGradient)" : "#8D402B"}
          />
          
          {/* Highlight (Top) for volume */}
          <path
            d="M160,70 C100,70 70,120 70,180"
            fill="none"
            stroke={isGolden ? "#FFF8E1" : "#A85842"}
            strokeWidth="10"
            strokeLinecap="round"
            opacity={isGolden ? "0.8" : "0.6"}
          />

          {/* The Resonance Slit (Mouth) */}
          <path
            d="M60,190 Q200,240 340,190"
            fill="none"
            stroke={isGolden ? "#BF360C" : "#3E1C14"}
            strokeWidth="18"
            strokeLinecap="round"
          />
          
          {/* Stylized Fish Eye (Left) */}
          <circle cx="120" cy="150" r="15" fill={isGolden ? "#BF360C" : "#3E1C14"} />
          
          {/* Stylized Fish Eye (Right) */}
          <circle cx="280" cy="150" r="15" fill={isGolden ? "#BF360C" : "#3E1C14"} />
          
          {/* Texture Details / Scales */}
          <path d="M180,90 Q200,100 220,90" stroke={isGolden ? "#E65100" : "#5D2E22"} strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M160,120 Q200,130 240,120" stroke={isGolden ? "#E65100" : "#5D2E22"} strokeWidth="3" fill="none" opacity="0.5" />
          
          {/* Extra Sparkles for Gold */}
          {isGolden && (
             <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                <circle cx="250" cy="100" r="4" fill="white" opacity="0.8" />
                <circle cx="100" cy="250" r="3" fill="white" opacity="0.6" />
             </g>
          )}
        </g>
      </svg>
      
      {/* The Stick (Mallet) */}
      <div 
        className={`absolute top-1/2 right-0 w-48 h-6 rounded-full origin-right transition-all duration-100 ease-in-out pointer-events-none ${isAnimating ? 'rotate-[0deg] translate-x-4 opacity-100' : 'rotate-[-25deg] translate-x-12 opacity-0'}`}
        style={{ background: isGolden ? 'linear-gradient(90deg, #FFD54F, #FF8F00)' : 'linear-gradient(90deg, #5d4037, #3e2723)' }}
      >
        {/* Mallet Head */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-lg"
          style={{ backgroundColor: isGolden ? '#FF8F00' : '#3e2723' }}
        ></div>
      </div>
    </div>
  );
};