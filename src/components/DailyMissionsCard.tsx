import React, { useState } from 'react';
import { GameState, DailyMission } from '../types/game';
import { sounds } from '../utils/audio';
import { addJournalEntry, INITIAL_JOURNAL_ENTRIES } from '../data/journalData';
import confetti from 'canvas-confetti';

interface DailyMissionsCardProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onNavigateTab?: (tab: 'home' | 'feed' | 'shop' | 'explore' | 'friends') => void;
  onPetSquishy?: () => void;
  onNapToggle?: () => void;
  onMissionClaimed?: (mission: DailyMission) => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  gameState,
  onUpdateState,
  onNavigateTab,
  onPetSquishy,
  onNapToggle,
  onMissionClaimed,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const missions: DailyMission[] = gameState.dailyMissions || [];
  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const allClaimed = missions.length > 0 && claimedCount === missions.length;
  const bonusClaimed = Boolean(gameState.dailyMissionsBonusClaimed);

  // Claim single mission reward
  const handleClaimMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    sounds.playLevelUp();
    sounds.playCoin();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
    });

    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );

    const bonusGems = mission.rewardGems || 0;
    const newCoins = (gameState.coins || 0) + mission.rewardCoins;
    const newGems = (gameState.gems || 0) + bonusGems;
    const newHappiness = Math.min(100, (gameState.happiness || 80) + 10);

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'mission',
      `Completed: ${mission.title}`,
      `Completed nursery quest and earned +${mission.rewardCoins} Coins${
        bonusGems ? ' and +' + bonusGems + ' Gems' : ''
      }!`,
      mission.icon || '📋'
    );

    onUpdateState({
      coins: newCoins,
      gems: newGems,
      happiness: newHappiness,
      dailyMissions: updatedMissions,
      journalEntries: updatedJournal,
    });

    if (onMissionClaimed) {
      onMissionClaimed({ ...mission, claimed: true });
    }
  };

  // Claim All Missions Completed Grand Bonus
  const handleClaimAllBonus = () => {
    if (!allClaimed || bonusClaimed) return;

    sounds.playLevelUp();
    sounds.playChime();

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    const bonusCoins = 300;
    const bonusGems = 15;

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'special',
      'Daily Super Chest Unlocked!',
      'Cleared all daily missions! Claimed the Grand Bonus of +300 Coins and +15 Gems.',
      '🏆',
      true
    );

    onUpdateState({
      coins: (gameState.coins || 0) + bonusCoins,
      gems: (gameState.gems || 0) + bonusGems,
      happiness: 100,
      dailyMissionsBonusClaimed: true,
      journalEntries: updatedJournal,
    });
  };

  // Simulation tool: reset / refresh missions for testing
  const handleResetMissions = () => {
    sounds.playTap();
    const freshMissions = missions.map((m) => ({
      ...m,
      current: 0,
      completed: false,
      claimed: false,
    }));
    onUpdateState({
      dailyMissions: freshMissions,
      dailyMissionsBonusClaimed: false,
    });
  };

  return (
    <div className="jelly-card rounded-3xl p-4 mb-4 border-2 border-indigo-200/90 shadow-lg relative overflow-hidden transition-all duration-300">
      {/* Decorative Atmosphere Gradient Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-bl from-indigo-300/20 via-purple-300/10 to-transparent blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-display font-black text-xs shadow-sm ring-2 ring-indigo-300/40">
            <span className="text-sm">📋</span>
            <span>DAILY MISSIONS</span>
          </div>

          <span className="text-[11px] font-bold text-stone-500">
            {completedCount}/{missions.length} Done
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetMissions}
            className="text-[10px] font-display font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300/70 px-2 py-0.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-2xs"
            title="Reset daily mission progress for testing"
          >
            <span>🔄</span> Reset
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stone-400 hover:text-stone-700 text-xs p-1 font-bold transition-transform"
            aria-label={isExpanded ? 'Collapse missions' : 'Expand missions'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Subheader tagline */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <h3 className="font-display font-extrabold text-stone-900 text-sm flex items-center gap-1">
            <span>✨</span> Squishy’s Daily Quests
          </h3>
          <p className="text-[11px] text-stone-600 font-semibold">
            Complete fun pet activities for bonus Coins & Gems!
          </p>
        </div>

        {allClaimed ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 animate-pulse">
            <span>🌟</span> All Cleared!
          </span>
        ) : (
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {missions.filter((m) => m.completed && !m.claimed).length > 0
              ? `${missions.filter((m) => m.completed && !m.claimed).length} to Claim!`
              : 'In Progress'}
          </span>
        )}
      </div>

      {/* Missions List */}
      {isExpanded && (
        <div className="space-y-2.5 relative z-10 animate-fadeIn">
          {missions.map((mission) => {
            const isReadyToClaim = mission.completed && !mission.claimed;
            const progressPercent = Math.min(100, (mission.current / mission.target) * 100);

            return (
              <div
                key={mission.id}
                className={`p-3 rounded-2xl border transition-all ${
                  mission.claimed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isReadyToClaim
                    ? 'bg-gradient-to-r from-amber-50 to-pink-50 border-amber-400 ring-2 ring-amber-300/60 shadow-md'
                    : 'bg-white/85 border-stone-200 shadow-2xs hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                        mission.claimed
                          ? 'bg-emerald-100 border-emerald-300'
                          : isReadyToClaim
                          ? 'bg-amber-100 border-amber-300 animate-bounce'
                          : 'bg-indigo-50 border-indigo-200'
                      }`}
                    >
                      <span>{mission.icon}</span>
                    </div>

                    <div>
                      <h4
                        className={`font-display font-black text-xs ${
                          mission.claimed
                            ? 'text-emerald-900 line-through opacity-80'
                            : 'text-stone-900'
                        }`}
                      >
                        {mission.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-semibold leading-tight line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div className="text-right shrink-0">
                    <span className="font-display font-black text-xs text-amber-700 block">
                      +{mission.rewardCoins} 🪙
                    </span>
                    {mission.rewardGems && (
                      <span className="font-display font-extrabold text-[10px] text-purple-700 block">
                        +{mission.rewardGems} 💎
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Action Row */}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {mission.current} / {mission.target}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          mission.claimed
                            ? 'bg-emerald-500'
                            : isReadyToClaim
                            ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                            : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Status / Claim / Go Button */}
                  <div className="shrink-0">
                    {mission.claimed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <span>✓</span> Claimed
                      </span>
                    ) : isReadyToClaim ? (
                      <button
                        type="button"
                        onClick={() => handleClaimMission(mission.id)}
                        className="py-1 px-3 rounded-full font-display font-black text-[11px] btn-squish-gold text-stone-900 shadow-sm animate-pulse cursor-pointer transition-transform active:scale-95"
                      >
                        Claim Reward!
                      </button>
                    ) : (
                      // Shortcut to perform mission task
                      <>
                        {mission.category === 'pet' && (
                          <button
                            type="button"
                            onClick={onPetSquishy}
                            className="py-1 px-2.5 rounded-full font-display font-bold text-[10px] bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Pet Now
                          </button>
                        )}
                        {mission.category === 'feed' && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab && onNavigateTab('feed')}
                            className="py-1 px-2.5 rounded-full font-display font-bold text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Feed ➔
                          </button>
                        )}
                        {mission.category === 'explore' && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab && onNavigateTab('explore')}
                            className="py-1 px-2.5 rounded-full font-display font-bold text-[10px] bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-300 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Explore ➔
                          </button>
                        )}
                        {mission.category === 'sleep' && (
                          <button
                            type="button"
                            onClick={onNapToggle}
                            className="py-1 px-2.5 rounded-full font-display font-bold text-[10px] bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Nap 🌙
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Grand Completion Chest: Unlock when all daily missions are claimed */}
          {allClaimed && (
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-100 via-rose-100 to-purple-100 border-2 border-amber-400 shadow-md relative overflow-hidden flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-white/90 border border-amber-300 flex items-center justify-center text-2xl shadow-xs shrink-0 animate-bounce">
                  <span>🏆</span>
                </div>

                <div>
                  <h4 className="font-display font-black text-xs text-stone-900 flex items-center gap-1.5">
                    <span>🌟</span> Daily Super Chest Unlocked!
                  </h4>
                  <p className="text-[10px] text-stone-600 font-semibold">
                    Bonus reward for clearing all missions today!
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {bonusClaimed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-full border border-emerald-400">
                    <span>✓</span> Bonus Claimed!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaimAllBonus}
                    className="py-1.5 px-3 rounded-full font-display font-black text-xs btn-squish-gold text-stone-900 shadow-md animate-pulse cursor-pointer transition-transform active:scale-95"
                  >
                    Open Chest (+300 🪙, +15 💎)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
