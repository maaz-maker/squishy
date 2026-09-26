import React from 'react';
import { sounds } from '../utils/audio';

interface PrologueModalProps {
  onClose: () => void;
}

export const PrologueModal: React.FC<PrologueModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md animate-fadeIn">
      <div className="jelly-pod max-w-sm w-full rounded-3xl p-6 text-center border-4 border-rose-300 shadow-2xl relative">
        <div className="text-4xl mb-1 animate-bounce">🥟👶</div>
        <span className="text-[10px] font-display font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200">
          PROLOGUE — LEVEL 1
        </span>

        <h3 className="font-display font-extrabold text-xl text-stone-900 mt-2 mb-2">
          Welcome to the World, Squishy!
        </h3>

        <div className="space-y-2 text-xs text-stone-600 font-medium leading-relaxed text-left bg-white/90 p-3.5 rounded-2xl border border-rose-100 mb-4">
          <p>
            In a warm sunlit bamboo basket in the toybox meadow, a tiny jelly dumpling popped into existence!
          </p>
          <p>
            His proud dumpling parents were overjoyed to welcome their adorable, soft baby. They gently patted him, taught him his first squishy bounce, and introduced him to you — his new best companion and guardian!
          </p>
          <p className="font-bold text-rose-600">
            Your Goal: Feed Baby Squishy tasty treats, give him loving pats, and help him grow into a strong, happy, and legendary jelly friend!
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playLevelUp();
            onClose();
          }}
          className="w-full py-3 rounded-full btn-squish-primary text-white font-display font-extrabold text-xs tracking-wider shadow-md"
        >
          Begin Caring for Baby Squishy!
        </button>
      </div>
    </div>
  );
};
