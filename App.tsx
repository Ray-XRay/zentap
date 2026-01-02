import React, { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from './services/audioService';
import { WoodenFish } from './components/WoodenFish';
import { FloatingText } from './components/FloatingText';
import { FloatingTextItem } from './types';
import { getZenQuote, FortuneResult } from './services/geminiService';
import { FortuneModal } from './components/FortuneModal';
import { BodhiTree } from './components/BodhiTree';
import { FortuneEntry } from './components/FortuneEntry';
import { Volume2, VolumeX, Sparkles, Loader2, Play, Pause } from 'lucide-react';

const App: React.FC = () => {
  // Global Persistence
  const [count, setCount] = useState<number>(0);
  const [isGolden, setIsGolden] = useState<boolean>(false);
  const [lastFortune, setLastFortune] = useState<FortuneResult | null>(null);
  
  // Session State
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'SESSION_END' | 'VIEW_FORTUNE'>('SESSION_END');
  
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAutoTapping, setIsAutoTapping] = useState<boolean>(false);
  const [autoTapTrigger, setAutoTapTrigger] = useState<number>(0); 
  
  const [zenQuote, setZenQuote] = useState<string>("心中无事，即是功德。");
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize state from local storage
  useEffect(() => {
    const savedCount = localStorage.getItem('zen-merit-count');
    if (savedCount) setCount(parseInt(savedCount, 10));

    const savedGolden = localStorage.getItem('zen-is-golden') === 'true';
    if (savedGolden) setIsGolden(true);

    const savedFortune = localStorage.getItem('zen-last-fortune');
    if (savedFortune) {
      try {
        setLastFortune(JSON.parse(savedFortune));
      } catch (e) {
        console.error("Failed to parse saved fortune");
      }
    }
  }, []);

  // Update local storage
  useEffect(() => {
    localStorage.setItem('zen-merit-count', count.toString());
  }, [count]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.toggleSound(newState);
  };

  const toggleAutoTap = () => {
    const newValue = !isAutoTapping;
    setIsAutoTapping(newValue);
    if (!newValue && isSessionActive) resetInactivityTimer();
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    // Only set timer if there is an active session
    inactivityTimerRef.current = setTimeout(() => {
        handleSessionEnd();
    }, 5000);
  }, []);

  const handleSessionEnd = () => {
    inactivityTimerRef.current = null;
    setSessionCount(currentSession => {
      if (currentSession >= 5) {
        setIsAutoTapping(false);
        setModalMode('SESSION_END');
        setIsModalOpen(true);
      } else {
        setIsSessionActive(false);
      }
      return currentSession; 
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (modalMode === 'SESSION_END') {
      setSessionCount(0);
      setIsSessionActive(false);
    }
  };

  const handleFortuneLoaded = (fortune: FortuneResult) => {
    if (fortune.luck === '大吉' && !isGolden) {
      setIsGolden(true);
      localStorage.setItem('zen-is-golden', 'true');
    }
    // Save the fortune
    setLastFortune(fortune);
    localStorage.setItem('zen-last-fortune', JSON.stringify(fortune));
  };

  const handleViewFortune = () => {
    if (lastFortune) {
      setModalMode('VIEW_FORTUNE');
      setIsModalOpen(true);
    }
  };

  // Tap Logic
  const performTap = useCallback((x: number, y: number, isAuto: boolean = false) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isAuto ? 10 : 15);
    }
    audioService.playWoodBlock();

    setCount(prev => prev + 1);
    setSessionCount(prev => prev + 1);
    setIsSessionActive(true);

    const newItem: FloatingTextItem = {
      id: nextId.current++,
      x,
      y,
      text: '功德 +1'
    };
    setFloatingTexts(prev => [...prev, newItem]);

    if (isAuto) setAutoTapTrigger(prev => prev + 1);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleManualTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isModalOpen) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX + (Math.random() * 20 - 10); 
    const y = clientY - 60;
    performTap(x, y, false);
  }, [performTap, isModalOpen]);

  // Auto Tap Interval
  useEffect(() => {
    let interval: any;
    if (isAutoTapping && !isModalOpen) {
      interval = setInterval(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const x = centerX + (Math.random() * 40 - 20);
        const y = centerY - 80;
        performTap(x, y, true);
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [isAutoTapping, isModalOpen, performTap]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const handleAnimationComplete = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  const fetchZenQuote = async () => {
    if (isLoadingQuote) return;
    setIsLoadingQuote(true);
    if (navigator.vibrate) navigator.vibrate(30);
    const quote = await getZenQuote();
    setZenQuote(quote);
    setIsLoadingQuote(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-between min-h-screen bg-[#f7f5f0] text-stone-700 overflow-hidden"
    >
      {/* Background Zen Element */}
      <BodhiTree />

      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply z-0" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
           }}>
      </div>

      {/* Header Area */}
      <div className="w-full max-w-md p-8 flex justify-between items-start z-20">
        <div className="flex flex-col">
          <span className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-1">Merit Counter</span>
          <span className="text-4xl font-light text-stone-800 tracking-wider font-mono">{count}</span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={toggleAutoTap}
            disabled={isModalOpen}
            className={`p-2 transition-colors rounded-full ${isAutoTapping ? 'bg-stone-200 text-stone-800' : 'text-stone-400 hover:text-stone-600'} disabled:opacity-30`}
          >
            {isAutoTapping ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={toggleSound}
            className="text-stone-400 hover:text-stone-600 transition-colors p-2"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 -mt-10">
        {/* Fortune Thumbnail (Floating on the right or embedded near fish) */}
        {lastFortune && !isModalOpen && (
           <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 animate-in fade-in slide-in-from-right duration-700">
             <FortuneEntry fortune={lastFortune} onClick={handleViewFortune} />
           </div>
        )}

        <WoodenFish 
          onClick={handleManualTap} 
          externalTrigger={autoTapTrigger} 
          isGolden={isGolden}
        />
        
        {isAutoTapping && (
          <p className="absolute bottom-8 text-xs text-stone-400 animate-pulse tracking-widest">
            自动积功德中...
          </p>
        )}
      </div>

      {/* Footer / Zen Quote */}
      <div className="w-full max-w-lg p-8 pb-16 z-20 flex flex-col items-center space-y-8">
        <div className="text-center space-y-4 max-w-xs mx-auto">
          <div className="h-px w-8 bg-stone-300 mx-auto mb-6"></div>
          <p className={`text-xl font-serif text-stone-700 leading-relaxed transition-opacity duration-700 ${isLoadingQuote ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
            {zenQuote}
          </p>
        </div>
        
        <button 
          onClick={fetchZenQuote}
          disabled={isLoadingQuote || isModalOpen}
          className="group flex items-center space-x-2 px-6 py-3 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoadingQuote ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} className="group-hover:text-amber-600 transition-colors" />
          )}
          <span className="text-sm tracking-widest font-light">
            {isLoadingQuote ? '感悟中...' : '每日一签'}
          </span>
        </button>
      </div>

      {/* Floating Text Overlay */}
      {floatingTexts.map(item => (
        <FloatingText 
          key={item.id} 
          item={item} 
          onComplete={handleAnimationComplete} 
        />
      ))}

      {/* Fortune Modal */}
      {isModalOpen && (
        <FortuneModal 
          sessionMerit={sessionCount} 
          existingFortune={modalMode === 'VIEW_FORTUNE' ? lastFortune : null}
          onClose={handleCloseModal} 
          onFortuneLoaded={handleFortuneLoaded}
        />
      )}
    </div>
  );
};

export default App;