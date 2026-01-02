import React, { useState, useEffect, useRef } from 'react';
import { FortuneResult, getFortune } from '../services/geminiService';
import { Loader2, X, Info } from 'lucide-react';

interface FortuneModalProps {
  sessionMerit?: number;
  existingFortune?: FortuneResult | null; // If provided, shows this immediately
  onClose: () => void;
  onFortuneLoaded?: (fortune: FortuneResult) => void;
}

export const FortuneModal: React.FC<FortuneModalProps> = ({ 
  sessionMerit = 0, 
  existingFortune = null,
  onClose, 
  onFortuneLoaded 
}) => {
  
  // Determine mode: Drawing new fortune OR Viewing existing
  const isViewMode = !!existingFortune;

  // Drawing Logic (Only applies if NOT in view mode)
  // Rule: > 200 is guaranteed. Base ~33% + 1% per merit.
  const canDraw = isViewMode || (sessionMerit >= 200 || (Math.random() * 100 < (33 + sessionMerit)));

  const [step, setStep] = useState<'summary' | 'loading' | 'result'>(
    isViewMode ? 'result' : (canDraw ? 'loading' : 'summary')
  );
  
  const [fortune, setFortune] = useState<FortuneResult | null>(existingFortune);

  useEffect(() => {
    // If we are in view mode, do nothing
    if (isViewMode) return;

    let isMounted = true;

    const fetchFortune = async () => {
      // Add a small delay for effect if auto-drawing immediately
      if (canDraw) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      const result = await getFortune();
      
      if (isMounted) {
        setFortune(result);
        setStep('result');
        if (onFortuneLoaded) {
          onFortuneLoaded(result);
        }
      }
    };

    if (canDraw) {
      fetchFortune();
    }

    return () => { isMounted = false; };
  }, [canDraw, isViewMode, onFortuneLoaded]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#f7f5f0] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-stone-200 relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center flex-1 overflow-y-auto">
          
          {step === 'summary' && (
            <>
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner">
                🧘
              </div>
              <h2 className="text-2xl font-serif text-stone-800 mb-2">修行暂停</h2>
              <div className="w-12 h-px bg-stone-300 my-4"></div>
              <p className="text-stone-500 mb-8">本次静修共积攒功德</p>
              <p className="text-6xl font-mono text-amber-700 font-light mb-10">{sessionMerit}</p>
              
              <div className="space-y-4 w-full">
                  <p className="text-sm text-stone-400">缘分未到，需多加积累</p>
                  <button
                  onClick={onClose}
                  className="w-full py-4 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  继续修行
                </button>
              </div>
            </>
          )}

          {step === 'loading' && (
            <div className="py-20 flex flex-col items-center justify-center h-full">
              <Loader2 size={48} className="animate-spin text-amber-700 mb-6" />
              <p className="text-xl font-serif text-stone-800 mb-2">诚心祈祷中...</p>
              <p className="text-sm text-stone-500">本次功德 {sessionMerit}</p>
            </div>
          )}

          {step === 'result' && fortune && (
            <div className="w-full animate-in slide-in-from-bottom-10 duration-500">
               {/* Header: Number and Luck */}
               <div className="flex justify-between items-start border-b-2 border-stone-800 pb-4 mb-6">
                 <div className="flex flex-col items-start">
                   <span className="text-xs text-stone-500 uppercase tracking-widest">Senso-ji</span>
                   <span className="text-xl font-serif font-bold">第{fortune.id}签</span>
                 </div>
                 <div className={`text-3xl font-serif font-bold writing-vertical-rl py-2 px-1 border-2 border-stone-800 ${
                   fortune.luck.includes('吉') ? 'text-red-700' : 'text-stone-600'
                 }`}>
                   {fortune.luck}
                 </div>
               </div>

               {/* Poem */}
               <div className="bg-stone-100 p-6 mb-6 rounded-sm">
                 <div className="grid grid-cols-4 gap-4 text-center font-serif text-lg text-stone-800 h-40 items-center">
                   {fortune.poem.slice().reverse().map((line, idx) => (
                     <div key={idx} className="h-full flex flex-col items-center justify-center border-l border-stone-300 last:border-l-0 writing-vertical-rl tracking-widest leading-loose">
                       {line}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Explanation */}
               <div className="text-left bg-[#fffcf5] p-4 border border-stone-200 rounded-lg shadow-sm">
                 <h4 className="font-bold text-stone-700 mb-2 text-sm">【解签】</h4>
                 <p className="text-stone-600 text-sm leading-relaxed text-justify">
                   {fortune.explanation}
                 </p>
               </div>

               {/* Disclaimer */}
               <div className="mt-4 flex items-center justify-center text-[10px] text-stone-400 space-x-1">
                 <Info size={12} />
                 <span>签文由 AI 随机生成，仅供娱乐</span>
               </div>
               
               <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors font-medium"
                >
                  {isViewMode ? '关闭' : '收入囊中'}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};