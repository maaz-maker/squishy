import React, { useState } from 'react';
import { GameState, AchievementBadge } from '../types/game';
import { ACHIEVEMENT_BADGES, getAchievementProgress } from '../data/achievementsData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface AchievementsSectionProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  compact?: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  gameState,
  onUpdateState,
  compact = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedIds = new Set(gameState.unlockedBadgeIds || []);
  const equippedBadgeId = gameState.equippedBadgeId;

  const equippedBadge = ACHIEVEMENT_BADGES.find((b) => b.id === equippedBadgeId);

  const handleEquipBadge = (badge: AchievementBadge) => {
    sounds.playChime();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6'],
    });

    onUpdateState({
      equippedBadgeId: badge.id === equippedBadgeId ? null : badge.id,
    });
  };

  const filteredBadges = ACHIEVEMENT_BADGES.filter((badge) => {
    const isUnlocked = unlockedIds.has(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = ACHIEVEMENT_BADGES.filter((b) => unlockedIds.has(b.id)).length;
  const totalCount = ACHIEVEMENT_BADGES.length;
  const overallPercent = Math.round((unlockedCount / totalCount) * 100);

  const getTierColor = (tier: AchievementBadge['tier']) => {
    switch (tier) {
      case 'celestial':
        return 'from-purple-500 via-pink-500 to-amber-400 border-purple-400 text-purple-900';
      case 'gold':
        return 'from-amber-400 to-yellow-500 border-amber-300 text-amber-900';
      case 'silver':
        return 'from-slate-300 to-slate-400 border-slate-300 text-slate-800';
      case 'bronze':
      default:
        return 'from-amber-700/60 to-orange-800/60 border-orange-300 text-orange-950';
    }
  };

  return (
    <div className={`space-y-3.5 ${compact ? '' : 'p-1'}`}>
      {/* Overview & Equipped Profile Badge Showcase */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-100/90 via-rose-50/80 to-purple-100/90 border-2 border-amber-300/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-amber-300 flex items-center justify-center text-2xl shrink-0 animate-bounce">
              {equippedBadge ? equippedBadge.icon : '🏆'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display font-extrabold text-sm text-stone-900">
                  Lifetime Milestones & Badges
                </h3>
                <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                  {unlockedCount}/{totalCount} Unlocked
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-semibold">
                {equippedBadge
                  ? `Active Profile Badge: ${equippedBadge.name} (${equippedBadge.icon})`
                  : 'Equip an unlocked badge to proudly display on your profile!'}
              </p>
            </div>
          </div>

          {equippedBadge && (
            <button
              type="button"
              onClick={() => onUpdateState({ equippedBadgeId: null })}
              className="text-[10px] text-stone-400 hover:text-stone-700 underline shrink-0 cursor-pointer"
              title="Unequip profile badge"
            >
              Unequip
            </button>
          )}
        </div>

        {/* Overall Completion Progress */}
        <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden border border-amber-200 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setFilter('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-display font-extrabold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setFilter('unlocked');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-display font-extrabold transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setFilter('locked');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-display font-extrabold transition-all cursor-pointer ${
              filter === 'locked'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            In Progress ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const isEquipped = equippedBadgeId === badge.id;
          const { current, target, completed, percent } = getAchievementProgress(badge, gameState);

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isEquipped
                  ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border-amber-400 ring-2 ring-amber-300 shadow-md'
                  : isUnlocked
                  ? 'bg-white/95 border-emerald-300 shadow-xs'
                  : 'bg-white/70 border-stone-200/90 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Badge Icon & Tier */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-xs relative ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-100 to-rose-100 border-amber-300'
                        : 'bg-stone-100 border-stone-300 grayscale opacity-75'
                    }`}
                  >
                    <span>{badge.icon}</span>
                    {isEquipped && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ring-1 ring-white">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4
                        className={`font-display font-black text-xs ${
                          isUnlocked ? 'text-stone-900' : 'text-stone-600'
                        }`}
                      >
                        {badge.name}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${getTierColor(
                          badge.tier
                        )}`}
                      >
                        {badge.tier}
                      </span>
                      {isEquipped && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
                          Active Badge
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 font-semibold leading-relaxed mt-0.5">
                      {badge.description}
                    </p>

                    {/* Progress Bar & Counter */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                        <span>Progress:</span>
                        <span className={isUnlocked ? 'text-emerald-600 font-black' : 'text-stone-700 font-black'}>
                          {Math.min(current, target)} / {target} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUnlocked
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action / Rewards */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="text-right">
                    <span className="font-display font-black text-[11px] text-amber-700 block">
                      +{badge.rewardCoins} 🪙
                    </span>
                    <span className="font-display font-extrabold text-[9px] text-purple-700 block">
                      +{badge.rewardGems} 💎
                    </span>
                  </div>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleEquipBadge(badge)}
                      className={`px-3 py-1 rounded-full font-display font-bold text-[11px] transition-all cursor-pointer shadow-2xs active:scale-95 ${
                        isEquipped
                          ? 'bg-amber-400 text-stone-900 border border-amber-500'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isEquipped ? 'Equipped ✓' : 'Equip Badge'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-extrabold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      Locked 🔒
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
