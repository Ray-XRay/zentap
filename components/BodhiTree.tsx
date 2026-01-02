import React from 'react';

export const BodhiTree: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-100 flex items-end justify-center md:justify-end">
      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[150%] md:w-[80%] h-auto text-stone-300 fill-current opacity-30 transform translate-y-10 md:translate-x-20"
        style={{ mixBlendMode: 'multiply' }}
      >
        <g id="bodhi-tree">
            {/* Main Trunk */}
            <path d="M450,800 C420,700 480,600 440,500 C400,400 300,450 250,350 C220,290 280,250 300,200" 
                  fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
            
            {/* Branch Right */}
            <path d="M440,550 C480,500 550,520 600,450 C630,410 620,350 650,300" 
                  fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />

            {/* Branch Left Low */}
            <path d="M430,700 C350,650 300,680 200,650" 
                  fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />

            {/* Leaves - Simplified Bodhi shapes (Heart shaped with drip tip) */}
            <g className="animate-pulse" style={{ animationDuration: '8s' }}>
                <path d="M250,350 Q230,320 250,300 Q270,320 250,350 Z" transform="scale(3) translate(-80,-80)" />
                <path d="M300,200 Q280,170 300,150 Q320,170 300,200 Z" transform="scale(2.5) translate(-100,-40)" />
                <path d="M600,450 Q580,420 600,400 Q620,420 600,450 Z" transform="scale(3.5) translate(-350,-80)" />
                <path d="M650,300 Q630,270 650,250 Q670,270 650,300 Z" transform="scale(2) translate(-250,-50)" />
                <path d="M200,650 Q180,620 200,600 Q220,620 200,650 Z" transform="scale(4) translate(-30,-100)" />
            </g>
            
            {/* Falling Leaf 1 */}
            <g className="animate-float-down" style={{ opacity: 0.6 }}>
                <path d="M400,100 Q380,70 400,50 Q420,70 400,100 Z" transform="rotate(15)" />
            </g>
        </g>
        
        {/* Style for leaves */}
        <style>{`
            @keyframes floatGentle {
                0%, 100% { transform: translateY(0) rotate(0); }
                50% { transform: translateY(10px) rotate(2deg); }
            }
            #bodhi-tree path {
                fill: currentColor;
            }
            #bodhi-tree path[fill="none"] {
                fill: none;
            }
        `}</style>
      </svg>
    </div>
  );
};