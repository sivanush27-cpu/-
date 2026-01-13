
import React, { useEffect, useState, useRef } from 'react';

interface StarDisplayProps {
  count: number;
  color: string;
}

const StarDisplay: React.FC<StarDisplayProps> = ({ count, color }) => {
  const [prevCount, setPrevCount] = useState(count);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (count > prevCount) {
      setPrevCount(count);
    } else if (count < prevCount) {
      setPrevCount(count);
    }
  }, [count, prevCount]);

  const playStarHoverSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // צליל גבוה ועדין של "טינג"
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
      
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center p-4 bg-white/30 backdrop-blur-md rounded-[2rem] min-h-[80px] shadow-inner border-2 border-white/40 relative overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const isNew = i === count - 1 && count > prevCount;
        return (
          <div
            key={`${i}-${count}`}
            onMouseEnter={playStarHoverSound}
            className={`relative text-4xl cursor-default transition-all duration-300 transform hover:scale-125 hover:rotate-12 hover:drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] ${
              isNew ? 'animate-star-pop-heavy z-10' : 'animate-star-float-varied'
            }`}
            style={{ 
              animationDelay: `${i * 0.12}s`,
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
            }}
          >
            <span className="relative z-10">⭐</span>
            
            {/* גלו חזק לכוכב חדש */}
            {isNew && (
              <>
                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl opacity-80 animate-star-pulse"></div>
                {/* חלקיקי "פיצוץ" (Burst) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(6)].map((_, j) => (
                    <div
                      key={j}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle-burst"
                      style={{
                        '--angle': `${j * 60}deg`,
                        '--delay': `${j * 0.05}s`
                      } as React.CSSProperties}
                    ></div>
                  ))}
                </div>
              </>
            )}
            
            {/* הילה עדינה קבועה שמתחזקת ב-Hover דרך ה-drop-shadow למעלה */}
            <div className="absolute inset-0 bg-yellow-200/20 rounded-full blur-md -z-10 transition-opacity group-hover:opacity-100"></div>
          </div>
        );
      })}
      
      {count === 0 && (
        <div className="flex items-center gap-2 text-emerald-900/60 font-bold italic animate-pulse">
          <span>✨</span>
          <span>מחכים לכוכב הראשון...</span>
          <span>✨</span>
        </div>
      )}

      <style>{`
        @keyframes star-pop-heavy {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.8) rotate(20deg); }
          75% { transform: scale(0.8) rotate(-10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes star-float-varied {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(2px) rotate(-2deg); }
        }

        @keyframes star-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }

        @keyframes sparkle-burst {
          0% { 
            transform: rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% { 
            transform: rotate(var(--angle)) translateY(-40px) scale(0);
            opacity: 0;
          }
        }

        .animate-star-pop-heavy {
          animation: star-pop-heavy 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-star-float-varied {
          animation: star-float-varied 4s ease-in-out infinite;
        }

        .animate-star-pulse {
          animation: star-pulse 2s ease-in-out infinite;
        }

        .animate-sparkle-burst {
          animation: sparkle-burst 0.6s ease-out forwards;
          animation-delay: var(--delay);
        }
      `}</style>
    </div>
  );
};

export default StarDisplay;
