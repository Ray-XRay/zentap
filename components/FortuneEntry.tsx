import React from 'react';
import { FortuneResult } from '../services/geminiService';
import { Scroll } from 'lucide-react';

interface FortuneEntryProps {
  fortune: FortuneResult;
  onClick: () => void;
}

export const FortuneEntry: React.FC<FortuneEntryProps> = ({ fortune, onClick }) => {
  const isGood = fortune.luck.includes('吉');
  
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95"
      aria-label="View current fortune"
    >
      {/* Omamori (Amulet) Shape */}
      <div className={`
        relative w-12 h-20 md:w-16 md:h-24 
        rounded-t-lg rounded-b-xl 
        shadow-lg border-2 border-[#d4c5b0]
        flex flex-col items-center justify-start pt-3
        transition-colors duration-300
        ${isGood ? 'bg-[#b83b3b] text-[#f7f5f0]' : 'bg-stone-600 text-[#f7f5f0]'}
      `}>
        {/* String knot visual */}
        <div className="absolute -top-3 w-8 h-8 md:w-10 md:h-10 border-2 border-white/50 rounded-full flex items-center justify-center z-10 bg-inherit">
           <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Text */}
        <div className="font-serif font-bold text-xs md:text-sm tracking-widest writing-vertical-rl mt-2 opacity-90">
            {fortune.luck}
        </div>
        
        {/* Decorative pattern at bottom */}
        <div className="absolute bottom-2 w-full flex justify-center opacity-50">
           <Scroll size={12} />
        </div>
      </div>
      
      {/* Label */}
      <span className="mt-2 text-xs text-stone-500 font-serif tracking-widest group-hover:text-amber-700 transition-colors bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
        今日签文
      </span>
    </button>
  );
};