import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  onComplete?: () => void;
}

export const SuccessAnimation = ({ onComplete }: SuccessAnimationProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),
      setTimeout(() => setStage(2), 400),
      setTimeout(() => setStage(3), 800),
      setTimeout(() => onComplete?.(), 2500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Ripple effects */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`absolute w-32 h-32 rounded-full border-2 border-emerald-500/30 transition-all duration-700 ${
              stage >= 1 ? 'scale-[2] opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          <div 
            className={`absolute w-32 h-32 rounded-full border-2 border-emerald-500/40 transition-all duration-700 delay-200 ${
              stage >= 2 ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          <div 
            className={`absolute w-32 h-32 rounded-full border-2 border-emerald-500/50 transition-all duration-700 delay-400 ${
              stage >= 3 ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'
            }`}
          />
        </div>

        {/* Success icon */}
        <div 
          className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 transition-all duration-500 ${
            stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <CheckCircle2 
            className={`w-16 h-16 text-white transition-all duration-300 ${
              stage >= 2 ? 'scale-100' : 'scale-0'
            }`}
          />
        </div>

        {/* Success text */}
        <div 
          className={`mt-8 text-center transition-all duration-500 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            Attendance Verified!
          </h2>
          <p className="text-slate-400">
            Successfully marked at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};
