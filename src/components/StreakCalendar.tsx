import React, { useState } from 'react';
import { GameState } from '../types/game';
import {
  DAILY_STREAK_REWARDS,
  calculateStreakStatus,
  getTodayDateString,
  getYesterdayDateString,
} from '../data/streakData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StreakCalendarProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onRewardClaimed?: (coins: number, gems: number, day: number) => void;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  gameState,
  onUpdateState,
  onRewardClaimed,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFastForwardNotice, setShowFastForwardNotice] = useState(false);

  const status = calculateStreakStatus(
    gameState.dailyStreak ?? 1,
    gameState.lastStreakClaimDate ?? null
  );

  const handleClaim = () => {
    if (!status.canClaimToday) return;

    sounds.playLevelUp();
    sounds.playCoin();

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.65 },
    });

    const reward = status.todayReward;
    const newStreak = status.totalStreak;
    const newMaxStreak = Math.max(gameState.maxStreak ?? 1, newStreak);
    const todayStr = getTodayDateString();

    const newCoins = (gameState.coins || 0) + reward.coins;
    const newGems = (gameState.gems || 0) + reward.gems;
    const newHappiness = Math.min(100, (gameState.happiness || 80) + 15);

    onUpdateState({
      coins: newCoins,
      gems: newGems,
      happiness: newHappiness,
      dailyStreak: newStreak,
      maxStreak: newMaxStreak,
      lastStreakClaimDate: todayStr,
    });

    if (onRewardClaimed) {
      onRewardClaimed(reward.coins, reward.gems, status.currentDayInCycle);
    }
  };

  // Simulation tool: fast forward 1 day so player / reviewer can test the full 7-day streak
  const handleFastForwardSimulation = () => {
    sounds.playTap();
    // Set lastStreakClaimDate to yesterday, which allows claiming the next streak day immediately
    const yesterdayStr = getYesterdayDateString();
    onUpdateState({
      lastStreakClaimDate: yesterdayStr,
      dailyStreak: status.isClaimedToday ? status.totalStreak : Math.max(1, status.totalStreak - 1),
    });
    setShowFastForwardNotice(true);
    setTimeout(() => setShowFastForwardNotice(false), 3000);
  };

  return (
    <div className="jelly-card rounded-3xl p-4 mb-4 border-2 border-amber-200/90 shadow-lg relative overflow-hidden transition-all duration-300">
      {/* Decorative Warm Golden Atmosphere Accent */}
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-bl from-amber-300/25 via-pink-300/15 to-transparent blur-2xl pointer-events-none" />

      {/* Top Header Row with Flame Badge & Toggle */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          {/* Animated Flame Streak Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-display font-black text-xs shadow-sm ring-2 ring-amber-300/40 animate-pulse">
            <span className="text-sm">🔥</span>
            <span>{status.totalStreak} DAY STREAK</span>
          </div>

          <span className="text-[11px] font-bold text-stone-500">
            🏆 Best: {Math.max(gameState.maxStreak ?? 1, status.totalStreak)}d
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Simulation Test Button */}
          <button
            type="button"
            onClick={handleFastForwardSimulation}
            className="text-[10px] font-display font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-2xs"
            title="Advance simulated clock by 1 day to test consecutive streak rewards"
          >
            <span>⏩</span> Next Day
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stone-400 hover:text-stone-700 text-xs p-1 font-bold transition-transform"
            aria-label={isExpanded ? 'Collapse calendar' : 'Expand calendar'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Simulation Feedback Notice */}
      {showFastForwardNotice && (
        <div className="mb-2 p-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold text-center animate-fadeIn">
          ⚡ Simulated 1 day passed! Next streak day is ready to claim!
        </div>
      )}

      {/* Streak Tagline */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <h3 className="font-display font-extrabold text-stone-900 text-sm flex items-center gap-1">
            <span>📅</span> Daily Streak Calendar
          </h3>
          <p className="text-[11px] text-stone-600 font-semibold">
            Open daily for escalating Coins, Gems & the Day 7 Jackpot!
          </p>
        </div>

        {/* Claim Status Capsule */}
        <div className="text-right">
          {status.canClaimToday ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 animate-bounce">
              <span>🎁</span> Ready to Claim!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              <span>✓</span> Claimed Today
            </span>
          )}
        </div>
      </div>

      {/* 7-Day Visual Calendar Grid */}
      {isExpanded && (
        <div className="relative z-10 animate-fadeIn">
          {/* Days 1 to 6 in a 3-column responsive grid */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {DAILY_STREAK_REWARDS.slice(0, 6).map((r) => {
              const isPast =
                r.day < status.currentDayInCycle ||
                (r.day === status.currentDayInCycle && status.isClaimedToday);
              const isToday = r.day === status.currentDayInCycle && status.canClaimToday;
              const isLocked = r.day > status.currentDayInCycle;

              return (
                <div
                  key={r.day}
                  onClick={() => {
                    if (isToday) handleClaim();
                  }}
                  className={`rounded-2xl p-2.5 border transition-all text-center relative overflow-hidden flex flex-col justify-between ${
                    isPast
                      ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-900 shadow-2xs'
                      : isToday
                      ? 'bg-gradient-to-b from-amber-50 to-rose-50 border-amber-400 ring-2 ring-amber-300/70 shadow-md scale-102 cursor-pointer'
                      : 'bg-white/80 border-stone-200/80 text-stone-400'
                  }`}
                >
                  {/* Status Indicator Stamp */}
                  <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                    <span
                      className={`font-display tracking-wider ${
                        isToday ? 'text-amber-800' : isPast ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      DAY {r.day}
                    </span>
                    {isPast && <span className="text-emerald-600 font-bold">✓</span>}
                    {isToday && (
                      <span className="text-[9px] bg-amber-400 text-stone-900 px-1.5 py-0.2 rounded-full font-black">
                        TODAY
                      </span>
                    )}
                    {isLocked && <span className="text-stone-400 text-[10px]">🔒</span>}
                  </div>

                  {/* Icon */}
                  <div className="my-1 flex items-center justify-center">
                    <span
                      className={`text-2xl transition-transform ${
                        isToday ? 'scale-115 animate-bounce' : isPast ? 'opacity-85' : 'opacity-40'
                      }`}
                    >
                      {r.icon}
                    </span>
                  </div>

                  {/* Rewards Breakdown */}
                  <div className="mt-1 pt-1 border-t border-black/5 flex items-center justify-center gap-1.5 text-[11px] font-display font-extrabold">
                    <span className={isPast ? 'text-emerald-800' : isToday ? 'text-amber-800' : 'text-stone-400'}>
                      +{r.coins} 🪙
                    </span>
                    <span className={isPast ? 'text-emerald-700' : isToday ? 'text-purple-700' : 'text-stone-400'}>
                      +{r.gems} 💎
                    </span>
                  </div>

                  <span className="text-[9px] font-bold text-stone-500 mt-0.5 truncate block">
                    {r.bonusTitle}
                  </span>
                </div>
              );
            })}
          </div>

          {/* DAY 7: Featured Rainbow Mythic Jackpot Card */}
          {DAILY_STREAK_REWARDS[6] && (() => {
            const r7 = DAILY_STREAK_REWARDS[6];
            const isPast =
              status.totalStreak >= 7 &&
              (status.currentDayInCycle > 7 || (status.currentDayInCycle === 7 && status.isClaimedToday));
            const isToday = status.currentDayInCycle === 7 && status.canClaimToday;
            const isLocked = status.currentDayInCycle < 7;

            return (
              <div
                onClick={() => {
                  if (isToday) handleClaim();
                }}
                className={`rounded-2xl p-3 border-2 transition-all relative overflow-hidden flex items-center justify-between gap-3 ${
                  isPast
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-50 border-emerald-300 text-emerald-950'
                    : isToday
                    ? 'bg-gradient-to-r from-amber-100 via-rose-100 to-purple-100 border-amber-400 ring-2 ring-amber-300 shadow-md scale-102 cursor-pointer'
                    : 'bg-gradient-to-r from-purple-50/70 via-pink-50/70 to-amber-50/70 border-purple-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-white/90 border border-amber-300 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    <span className={isToday ? 'animate-bounce' : ''}>🌈</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-xs text-purple-900 tracking-wider">
                        DAY 7 JACKPOT
                      </span>
                      {isToday && (
                        <span className="text-[9px] bg-rose-500 text-white px-2 py-0.2 rounded-full font-black animate-pulse">
                          CLAIM NOW!
                        </span>
                      )}
                      {isPast && <span className="text-emerald-600 font-bold text-xs">✓ Claimed</span>}
                      {isLocked && <span className="text-stone-400 text-xs">🔒 Milestone</span>}
                    </div>

                    <h4 className="font-display font-extrabold text-xs text-stone-900">
                      {r7.bonusTitle}
                    </h4>
                    <p className="text-[10px] text-stone-500 font-semibold">
                      Massive jackpot cache of shiny riches
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display font-black text-sm text-amber-900 flex items-center justify-end gap-1">
                    <span>+{r7.coins}</span>
                    <span>🪙</span>
                  </div>
                  <div className="font-display font-black text-xs text-purple-700 flex items-center justify-end gap-1">
                    <span>+{r7.gems}</span>
                    <span>💎</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Claim Action Button or Tomorrow Teaser */}
      <div className="mt-3 relative z-10">
        {status.canClaimToday ? (
          <button
            type="button"
            onClick={handleClaim}
            className="w-full py-2.5 rounded-full font-display font-black text-xs tracking-wide btn-squish-gold text-stone-900 flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <span>🎁</span>
            <span>
              Claim Day {status.currentDayInCycle} (+{status.todayReward.coins} 🪙, +
              {status.todayReward.gems} 💎)
            </span>
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-2xl bg-stone-100/90 border border-stone-200 flex items-center justify-between text-xs text-stone-600 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span>✓</span> Day {status.currentDayInCycle} reward claimed!
            </span>
            <span className="text-[11px] text-stone-500">
              Tomorrow: +{status.nextReward.coins} 🪙, +{status.nextReward.gems} 💎
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
