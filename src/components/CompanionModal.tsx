import React from 'react';
import { sounds } from '../utils/audio';

interface CompanionModalProps {
  level: number;
  squishyName: string;
  onJumpToLevel: (lvl: number) => void;
  onClose: () => void;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  level,
  squishyName,
  onJumpToLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div className="jelly-pod max-w-sm w-full rounded-3xl p-5 text-center border-4 border-amber-200 shadow-2xl relative">
        {/* Companion Avatar Image 2 Style */}
        <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-100 via-sky-100 to-emerald-100 border-3 border-white shadow-lg mx-auto flex items-center justify-center text-4xl mb-2 relative">
          <span>👦</span>
          <span className="absolute -top-1 -right-1 text-lg">🧢</span>
        </div>

        <h3 className="font-display font-extrabold text-lg text-stone-900 mb-0.5">
          Leo, Your Companion Guide
        </h3>
        <p className="text-xs text-stone-500 font-semibold mb-3">
          “I’m right here beside you and {squishyName} on this adventure!”
        </p>

        {/* Tip Box */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-left text-xs font-medium text-stone-700 leading-relaxed mb-4">
          <div className="font-display font-extrabold text-amber-900 mb-1 flex items-center gap-1">
            <span>💡</span> Companion Care Tip:
          </div>
          {level <= 2 &&
            'Baby Squishy loves warm rice ball dumplings and gentle pats! Keep feeding him treats in the Growth Lab to boost his XP.'}
          {level >= 3 && level <= 5 &&
            'Try outfitting Squishy in the Boutique Shop! Hats and accessories grant fun status bonuses like damp resistance and cute charm.'}
          {level >= 6 && level <= 8 &&
            'Don’t forget to tuck Squishy in for a nap when he gets sleepy. High home comfort boosts vitality and recovery speed!'}
          {level >= 9 &&
            'The Meadow Friends love sharing treats! Visit Pippin the Bunny and Master Bao to exchange gifts and complete companion quests.'}
        </div>

        {/* Fast Level Progression Tester (Super helpful for user testing Levels 1 - 10) */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 text-left mb-4">
          <span className="text-[10px] font-display font-black text-purple-600 uppercase tracking-wider block mb-1.5">
            ✨ Quick Level Warp (Tester Jump):
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  sounds.playLevelUp();
                  onJumpToLevel(lvl);
                }}
                className={`py-1.5 rounded-xl font-display font-extrabold text-xs transition-all ${
                  level === lvl
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Lv.{lvl}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="w-full py-2.5 rounded-full btn-squish-primary text-white font-display font-extrabold text-xs shadow-md"
        >
          Got it, Leo!
        </button>
      </div>
    </div>
  );
};
