import React from 'react';
import { sounds } from '../utils/audio';
import { ACHIEVEMENT_BADGES } from '../data/achievementsData';

interface TopBarProps {
  level: number;
  coins: number;
  gems: number;
  happiness: number;
  squishyName: string;
  onOpenCompanionChat?: () => void;
  onClaimFreeGift?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  equippedBadgeId?: string | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  level,
  coins,
  gems,
  happiness,
  onOpenCompanionChat,
  onClaimFreeGift,
  isMuted,
  onToggleMute,
  equippedBadgeId,
}) => {
  const equippedBadge = ACHIEVEMENT_BADGES.find((b) => b.id === equippedBadgeId);

  return (
    <header className="sticky top-0 z-30 px-3 pt-2 pb-2 bg-[#fbf9f4]/95 backdrop-blur-md border-b border-rose-100/60 transition-all">
      <div className="flex items-center justify-between gap-1.5 max-w-md mx-auto">
        {/* Left: Squishy Mini Icon + Level Capsule */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-300 via-rose-200 to-purple-200 p-0.5 shadow-sm border border-white flex items-center justify-center">
            <span className="text-base select-none">🥟</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 shadow-xs">
            <span className="text-amber-500 text-xs">✨</span>
            <span className="font-display font-extrabold text-xs text-amber-900 tracking-wide">
              Lv. {level}
            </span>
          </div>

          {equippedBadge && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-100 border border-amber-300 text-stone-900 shadow-2xs font-display font-black text-xs animate-fadeIn cursor-pointer"
              title={`Equipped Profile Badge: ${equippedBadge.name}`}
            >
              <span>{equippedBadge.icon}</span>
              <span className="text-[10px] hidden sm:inline">{equippedBadge.name}</span>
            </div>
          )}
        </div>

        {/* Center: Currencies (Coins & Gems) */}
        <div className="flex items-center gap-1.5">
          {/* Coins Pill */}
          <button
            onClick={() => {
              sounds.playCoin();
              if (onClaimFreeGift) onClaimFreeGift();
            }}
            title="Coins (+50 free coins)"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-950 hover:bg-amber-200/80 transition-colors shadow-2xs group"
          >
            <span className="text-sm">🪙</span>
            <span className="font-display font-bold text-xs tracking-tight">
              {coins.toLocaleString()}
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center -mr-0.5 group-hover:scale-110">
              +
            </span>
          </button>

          {/* Gems Pill */}
          <button
            onClick={() => {
              sounds.playChime();
              if (onClaimFreeGift) onClaimFreeGift();
            }}
            title="Gems (+5 free gems)"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100/80 border border-sky-300/80 text-sky-950 hover:bg-sky-200/80 transition-colors shadow-2xs group"
          >
            <span className="text-sm">💎</span>
            <span className="font-display font-bold text-xs tracking-tight">
              {gems.toLocaleString()}
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-sky-400 text-white text-[10px] font-bold flex items-center justify-center -mr-0.5 group-hover:scale-110">
              +
            </span>
          </button>
        </div>

        {/* Right: Sound toggle & Companion Avatar (Image 2 representation!) */}
        <div className="flex items-center gap-1.5">
          {/* Audio Mute Button */}
          <button
            onClick={onToggleMute}
            className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-xs text-rose-700 hover:bg-rose-100 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Companion Avatar Button (Boy with beast hat & hoodie from Image 2!) */}
          <button
            onClick={onOpenCompanionChat}
            className="relative w-8 h-8 rounded-full bg-gradient-to-b from-amber-100 to-teal-100 border-2 border-white shadow-xs overflow-hidden hover:scale-105 active:scale-95 transition-transform"
            title="Companion Guide & Tips"
          >
            <div className="w-full h-full flex items-center justify-center text-base">
              👦
            </div>
            {/* Tiny mint monster beanie badge */}
            <span className="absolute -top-1 -right-1 text-[10px]">🧢</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Pet Happiness percentage indicator */}
      <div className="flex items-center justify-end max-w-md mx-auto pt-1 pr-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Pet Happy: {happiness}%</span>
        </div>
      </div>
    </header>
  );
};
