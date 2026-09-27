import React, { useState, useEffect, useRef } from 'react';
import { GameState, DailyMission } from '../types/game';
import { sounds } from '../utils/audio';
import { addJournalEntry, INITIAL_JOURNAL_ENTRIES } from '../data/journalData';
import confetti from 'canvas-confetti';

interface DailyMissionsCardProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onNavigateTab?: (tab: 'home' | 'feed' | 'shop' | 'explore' | 'friends') => void;
  onPetSquishy?: () => void;
  onPlaySquishy?: () => void;
  onQuickFeed?: () => void;
  onNapToggle?: () => void;
  onMissionClaimed?: (mission: DailyMission) => void;
}

interface RadialMissionProgressProps {
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  size?: number;
  strokeWidth?: number;
  id: string;
}

export const RadialMissionProgress: React.FC<RadialMissionProgressProps> = ({
  current,
  target,
  completed,
  claimed,
  size = 38,
  strokeWidth = 3.5,
  id,
}) => {
  const progressPercent = Math.min(100, Math.max(0, Math.round((current / (target || 1)) * 100)));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const gradId = `radial-grad-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      title={
        claimed
          ? 'Mission Claimed (100%)'
          : completed
          ? 'Mission Completed! Ready to claim (100%)'
          : `Mission In Progress: ${current}/${target} (${progressPercent}%)`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 overflow-visible"
      >
        <defs>
          <linearGradient id={`${gradId}-active`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id={`${gradId}-claimed`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={claimed ? '#ecfdf5' : completed ? '#fffbeb' : '#f8fafc'}
          stroke={claimed ? '#d1fae5' : completed ? '#fef3c7' : '#e2e8f0'}
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Animated Radial Bar Stroke */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={
            claimed
              ? `url(#${gradId}-claimed)`
              : completed
              ? `url(#${gradId}-gold)`
              : `url(#${gradId}-active)`
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label / Checkmark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {claimed ? (
          <span className="text-xs font-black text-emerald-600">✓</span>
        ) : completed ? (
          <span className="text-xs font-black text-amber-500 animate-bounce">✓</span>
        ) : size <= 26 ? null : (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] font-black text-indigo-700 font-display">
              {progressPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  gameState,
  onUpdateState,
  onNavigateTab,
  onPetSquishy,
  onPlaySquishy,
  onQuickFeed,
  onNapToggle,
  onMissionClaimed,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [activeHelpId, setActiveHelpId] = useState<string | null>(null);
  const prevProgressRef = useRef<Record<string, number>>({});

  const getMissionHowTo = (mission: DailyMission): string => {
    switch (mission.category) {
      case 'pet':
        return 'Gently tap or tickle Squishy directly on the screen, or click the "Pet Squishy" / "Tickle & Pet" button in the nursery.';
      case 'feed':
        return 'Tap "Quick Snack" right here on this card, or visit the Feed Tab to serve delicious dumplings and treats.';
      case 'play':
        return 'Tap "Play Now" or "Play Bounce" to toss colorful balls and toys with Squishy to spark joyful giggles.';
      case 'explore':
        return 'Tap "Explore ➔" to venture into the Meadow or Sunlit Forest to forage shiny items and forest discoveries.';
      case 'sleep':
        return 'Tap "Nap Time" or the moon button to dim nursery lights and let Squishy tuck in for a restful nap.';
      default:
        return mission.description || 'Complete this daily activity with Squishy to earn bonus Coins and Gems!';
    }
  };

  const missions: DailyMission[] = gameState.dailyMissions || [];
  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const allClaimed = missions.length > 0 && claimedCount === missions.length;
  const bonusClaimed = Boolean(gameState.dailyMissionsBonusClaimed);

  // Overall progress percentage
  const totalTargetSteps = missions.reduce((sum, m) => sum + m.target, 0);
  const currentTotalSteps = missions.reduce((sum, m) => sum + Math.min(m.current, m.target), 0);
  const overallPercent = totalTargetSteps > 0
    ? Math.round((currentTotalSteps / totalTargetSteps) * 100)
    : 0;

  // Track real-time changes to trigger flash / pulse effect
  useEffect(() => {
    missions.forEach((m) => {
      const prev = prevProgressRef.current[m.id];
      if (prev !== undefined && m.current > prev) {
        setRecentlyUpdatedId(m.id);
        const timer = setTimeout(() => setRecentlyUpdatedId(null), 1800);
        return () => clearTimeout(timer);
      }
    });

    const newMap: Record<string, number> = {};
    missions.forEach((m) => {
      newMap[m.id] = m.current;
    });
    prevProgressRef.current = newMap;
  }, [missions]);

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
      `Completed daily quest and collected +${mission.rewardCoins} Coins${
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
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-bl from-indigo-300/25 via-pink-300/15 to-transparent blur-2xl pointer-events-none" />

      {/* Card Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-display font-black text-xs shadow-sm ring-2 ring-indigo-300/40">
            <span className="text-sm">📋</span>
            <span>DAILY MISSIONS</span>
          </div>

          {/* Real-time Live Badge */}
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>LIVE</span>
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

      {/* Subheader tagline & overall progress */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <h3 className="font-display font-extrabold text-stone-900 text-sm flex items-center gap-1">
              <span>✨</span> Squishy’s Daily Quests
            </h3>
            <p className="text-[11px] text-stone-600 font-semibold">
              Complete actions in real-time for bonus Coins & Gems!
            </p>
          </div>

          {allClaimed ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 animate-pulse">
              <span>🌟</span> All Cleared!
            </span>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              <RadialMissionProgress
                id="overall-missions-badge"
                current={currentTotalSteps}
                target={totalTargetSteps || 1}
                completed={allCompleted}
                claimed={allClaimed}
                size={20}
                strokeWidth={2.5}
              />
              <span>
                {completedCount}/{missions.length} Complete ({overallPercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Overall Completion Visual Bar */}
        <div className="w-full bg-stone-100/90 rounded-full h-2 overflow-hidden border border-stone-200/80 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Missions List */}
      {isExpanded && (
        <div className="space-y-3 relative z-10 animate-fadeIn">
          {missions.map((mission) => {
            const isReadyToClaim = mission.completed && !mission.claimed;
            const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const isUpdatedRecently = recentlyUpdatedId === mission.id;

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isUpdatedRecently
                    ? 'ring-3 ring-pink-400/80 scale-[1.01] shadow-md'
                    : ''
                } ${
                  mission.claimed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isReadyToClaim
                    ? 'bg-gradient-to-r from-amber-50 to-pink-50 border-amber-400 ring-2 ring-amber-300/60 shadow-md'
                    : 'bg-white/90 border-stone-200 shadow-2xs hover:border-indigo-200'
                }`}
              >
                {/* Header row with Radial Bar Indicator, Icon, Title and Reward */}
                <div className="flex items-start justify-between gap-2.5 mb-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* Visual Circular Progress Indicator (Radial Bar) replacing standard checkbox */}
                    <div className="mt-0.5 shrink-0">
                      <RadialMissionProgress
                        id={mission.id}
                        current={mission.current}
                        target={mission.target}
                        completed={mission.completed}
                        claimed={mission.claimed}
                        size={38}
                        strokeWidth={3.5}
                      />
                    </div>

                    {/* Mission Icon & Info */}
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                          mission.claimed
                            ? 'bg-emerald-100 border-emerald-300'
                            : isReadyToClaim
                            ? 'bg-amber-100 border-amber-300'
                            : 'bg-indigo-50 border-indigo-200'
                        }`}
                      >
                        <span>{mission.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`font-display font-black text-xs leading-tight ${
                              mission.claimed
                                ? 'text-emerald-900 line-through opacity-80'
                                : 'text-stone-900'
                            }`}
                          >
                            {mission.title}
                          </h4>

                          {/* Subtle '?' info button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playTap();
                              setActiveHelpId((prev) => (prev === mission.id ? null : mission.id));
                            }}
                            className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer shadow-2xs ${
                              activeHelpId === mission.id
                                ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-200 scale-105'
                                : 'bg-stone-100 hover:bg-indigo-50 text-stone-400 hover:text-indigo-600 border-stone-300/80 hover:border-indigo-300'
                            }`}
                            title="How to complete this mission"
                            aria-label={`How to complete: ${mission.title}`}
                          >
                            ?
                          </button>

                          {isReadyToClaim && (
                            <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider animate-pulse">
                              Ready!
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-500 font-semibold leading-tight line-clamp-1 mt-0.5">
                          {mission.description}
                        </p>
                      </div>
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

                {/* Subtle '?' Description Guide Card */}
                {activeHelpId === mission.id && (
                  <div className="mt-2 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/90 text-stone-800 text-[11px] leading-relaxed shadow-xs flex items-start gap-2 animate-fadeIn">
                    <span className="text-sm shrink-0">💡</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-display font-extrabold text-[11px] text-indigo-900 flex items-center gap-1">
                          <span>Mission Guide:</span>
                          <span className="text-[10px] font-normal text-indigo-600">({mission.category})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveHelpId(null)}
                          className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1 rounded-sm leading-none cursor-pointer"
                          aria-label="Close guide"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[10.5px] text-stone-600 font-semibold leading-normal">
                        {getMissionHowTo(mission)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Real-time Progress Bar & Step Checkboxes */}
                <div className="mt-2.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                        Progress:
                      </span>
                      <span className={`font-black ${mission.completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {mission.current} / {mission.target}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        ({progressPercent}%)
                      </span>
                    </div>

                    {/* Step Checkbox Ticks (e.g. [✓] [✓] [ ]) */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: mission.target }).map((_, stepIdx) => {
                        const isStepDone = stepIdx < mission.current;
                        return (
                          <div
                            key={stepIdx}
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black border transition-all ${
                              isStepDone
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-2xs scale-105'
                                : 'bg-stone-100 border-stone-300 text-stone-400'
                            }`}
                            title={`Step ${stepIdx + 1} ${isStepDone ? 'Completed' : 'Pending'}`}
                          >
                            {isStepDone ? '✓' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual Progress Bar with Animated Fill */}
                  <div className="w-full h-3 bg-stone-100/90 rounded-full overflow-hidden border border-stone-200/80 shadow-inner relative mb-2.5">
                    <div
                      className={`h-full transition-all duration-500 ease-out relative ${
                        mission.claimed
                          ? 'bg-emerald-500'
                          : isReadyToClaim
                          ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 shadow-sm'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    >
                      {/* Shimmer light bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/35 to-white/0 animate-shimmer" />
                    </div>
                  </div>

                  {/* Interactive Action Row: Instant Trigger Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-400 font-semibold">
                      {mission.claimed
                        ? 'Completed and collected!'
                        : isReadyToClaim
                        ? 'Reward is ready to collect!'
                        : 'Tap action to progress in real-time:'}
                    </span>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {mission.claimed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                          <span>✓</span> Claimed
                        </span>
                      ) : isReadyToClaim ? (
                        <button
                          type="button"
                          onClick={() => handleClaimMission(mission.id)}
                          className="py-1 px-3 rounded-full font-display font-black text-xs btn-squish-gold text-stone-900 shadow-md animate-pulse cursor-pointer transition-transform active:scale-95 flex items-center gap-1"
                        >
                          <span>🎁</span> Claim Reward!
                        </button>
                      ) : (
                        // Real-time Action buttons right in the Home Tab
                        <>
                          {mission.category === 'pet' && (
                            <button
                              type="button"
                              onClick={onPetSquishy}
                              className="py-1 px-3 rounded-full font-display font-bold text-[11px] bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <span>👆</span> Pet Squishy
                            </button>
                          )}

                          {mission.category === 'play' && (
                            <button
                              type="button"
                              onClick={onPlaySquishy}
                              className="py-1 px-3 rounded-full font-display font-bold text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <span>🎾</span> Play Now
                            </button>
                          )}

                          {mission.category === 'feed' && (
                            <div className="flex items-center gap-1">
                              {onQuickFeed && (
                                <button
                                  type="button"
                                  onClick={onQuickFeed}
                                  className="py-1 px-2.5 rounded-full font-display font-bold text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                                  title="Feed sweet treat now"
                                >
                                  <span>🍓</span> Quick Snack
                                </button>
                              )}
                              {onNavigateTab && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateTab('feed')}
                                  className="py-1 px-2 rounded-full font-display font-bold text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-all active:scale-95 cursor-pointer"
                                >
                                  Feed Lab ➔
                                </button>
                              )}
                            </div>
                          )}

                          {mission.category === 'sleep' && (
                            <button
                              type="button"
                              onClick={onNapToggle}
                              className="py-1 px-3 rounded-full font-display font-bold text-[11px] bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <span>🌙</span> Nap Time
                            </button>
                          )}

                          {mission.category === 'explore' && onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab('explore')}
                              className="py-1 px-3 rounded-full font-display font-bold text-[11px] bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <span>🧭</span> Explore ➔
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
