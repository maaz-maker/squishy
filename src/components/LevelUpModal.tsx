import React from 'react';
import { LevelConfig } from '../types/game';
import { SquishyView } from './SquishyView';
import { sounds } from '../utils/audio';

interface LevelUpModalProps {
  levelConfig: LevelConfig;
  skin: any;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  levelConfig,
  skin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div className="jelly-pod max-w-sm w-full rounded-3xl p-6 text-center border-4 border-pink-300 shadow-2xl relative overflow-hidden">
        {/* Sparkle banner */}
        <div className="text-3xl mb-1 animate-bounce">🎉✨</div>
        <span className="text-[11px] font-display font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200">
          GROWTH EVOLUTION!
        </span>

        <h3 className="font-display font-extrabold text-xl text-stone-900 mt-2 mb-1">
          LEVEL {levelConfig.level}: {levelConfig.title}!
        </h3>
        <p className="text-xs text-stone-600 font-medium mb-3">
          {levelConfig.unlockDescription}
        </p>

        {/* Celebrating Squishy View */}
        <div className="py-2 flex justify-center">
          <SquishyView
            skin={skin}
            stage={levelConfig.stageName}
            level={levelConfig.level}
            isCelebrating={true}
            size={180}
            showPedestal={true}
          />
        </div>

        {/* Unlocked Features */}
        <div className="text-left bg-white/90 rounded-2xl p-3 border border-pink-100 shadow-inner my-3">
          <span className="text-[10px] font-display font-black text-stone-400 uppercase tracking-wider block mb-1">
            New Unlocks & Capabilities:
          </span>
          <ul className="space-y-1">
            {levelConfig.features.map((feat, idx) => (
              <li
                key={idx}
                className="text-xs font-bold text-stone-800 flex items-center gap-1.5"
              >
                <span className="text-rose-500">✨</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playSquish();
            onClose();
          }}
          className="w-full py-3 rounded-full btn-squish-primary text-white font-display font-extrabold text-sm tracking-wide shadow-md transition-transform active:scale-95"
        >
          Yay, Squishy! Keep Growing!
        </button>
      </div>
    </div>
  );
};
