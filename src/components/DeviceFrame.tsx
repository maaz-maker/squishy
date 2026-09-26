import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex flex-col items-center justify-start py-0 md:py-6 px-0 md:px-4">
      {/* Top Desktop Navigation & Frame Controls */}
      <div className="w-full max-w-md hidden md:flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥟</span>
          <span className="font-display font-extrabold text-sm text-stone-800 tracking-wide">
            SQUISHY Mobile Simulation
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            setIsMobileFrame(!isMobileFrame);
          }}
          className="flex items-center gap-1.5 text-xs font-display font-bold text-stone-600 bg-white/90 border border-stone-300/80 px-3 py-1 rounded-full shadow-2xs hover:bg-stone-50 transition-colors"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-stone-500" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              <span>Mobile Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[430px] min-h-screen md:min-h-[890px] md:max-h-[92vh] md:rounded-[48px] md:shadow-[0_25px_60px_-15px_rgba(74,62,78,0.22)] md:border-[10px] md:border-[#fce7f3] overflow-hidden relative flex flex-col bg-[#fbf9f4]'
            : 'max-w-2xl min-h-screen relative flex flex-col bg-[#fbf9f4] shadow-md md:rounded-3xl'
        }`}
      >
        {/* Mobile Camera Island Notch on Desktop Frame */}
        {isMobileFrame && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-transparent absolute top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-end pr-2">
              <span className="w-2 h-2 rounded-full bg-stone-800 border border-stone-700" />
            </div>
          </div>
        )}

        {/* Inner Scrollable Screen */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
