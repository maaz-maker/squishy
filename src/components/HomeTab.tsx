import React, { useState, useEffect } from 'react';
import { GameState, SquishyColor, SquishyPersonality, LevelConfig, SquishySkin, SquishyExpression } from '../types/game';
import { SquishyView } from './SquishyView';
import { WeatherBackground, SimulatedWeather } from './WeatherBackground';
import { StreakCalendar } from './StreakCalendar';
import { DailyMissionsCard } from './DailyMissionsCard';
import { JournalCard } from './JournalCard';
import { JournalModal } from './JournalModal';
import { updateMissionCategoryProgress, DEFAULT_DAILY_MISSIONS } from '../data/missionsData';
import { sounds } from '../utils/audio';
import { LEVELS } from '../data/gameData';
import confetti from 'canvas-confetti';

export interface GrowthEvent {
  prevLevel: number;
  newLevel: number;
  levelConfig: LevelConfig;
}

/**
 * Hook to manage lively emotional expressions and temporary visual classes
 * for Squishy during idle states in the Nursery room.
 */
export function useSquishyIdleEmotions(personality: SquishyPersonality, isSleeping: boolean) {
  const [expression, setExpression] = useState<SquishyExpression>('default');
  const [emotionBubble, setEmotionBubble] = useState<string | null>(null);
  const [temporaryClass, setTemporaryClass] = useState<string>('');
  const [isAffectionActive, setIsAffectionActive] = useState<boolean>(false);

  // Sleeping state takes absolute precedence
  useEffect(() => {
    if (isSleeping) {
      setExpression('sleepy');
      setEmotionBubble('💤');
      setTemporaryClass('opacity-90');
    } else {
      setExpression('default');
      setEmotionBubble(null);
      setTemporaryClass('');
    }
  }, [isSleeping]);

  // Periodic ambient emotional triggers while awake
  useEffect(() => {
    if (isSleeping) return;

    const personalityPool: Record<
      SquishyPersonality,
      { expression: SquishyExpression; bubble: string | null; tempClass: string }[]
    > = {
      Playful: [
        { expression: 'winking', bubble: '😉', tempClass: 'scale-105 transition-transform duration-300' },
        { expression: 'giggling', bubble: '🤭', tempClass: 'animate-bounce' },
        { expression: 'excited', bubble: '✨', tempClass: 'scale-105 animate-bounce' },
        { expression: 'happy', bubble: '🌸', tempClass: 'scale-102 transition-transform duration-200' },
        { expression: 'curious', bubble: '❓', tempClass: 'rotate-3 transition-transform duration-300' },
      ],
      Sleepy: [
        { expression: 'sleepy', bubble: '🥱', tempClass: 'opacity-90' },
        { expression: 'curious', bubble: '👀', tempClass: '-rotate-2' },
        { expression: 'happy', bubble: '🌸', tempClass: 'scale-102' },
        { expression: 'default', bubble: null, tempClass: '' },
      ],
      Curious: [
        { expression: 'curious', bubble: '❓', tempClass: 'rotate-3 transition-transform duration-300' },
        { expression: 'surprised', bubble: '😮', tempClass: 'scale-108 transition-transform duration-200' },
        { expression: 'starry_eyed', bubble: '⭐', tempClass: 'scale-105 brightness-110' },
        { expression: 'winking', bubble: '✨', tempClass: 'scale-105' },
        { expression: 'happy', bubble: '💡', tempClass: 'scale-102' },
      ],
      Friendly: [
        { expression: 'happy', bubble: '🌸', tempClass: 'scale-102' },
        { expression: 'loving', bubble: '💖', tempClass: 'animate-pulse scale-105' },
        { expression: 'giggling', bubble: '🎶', tempClass: 'animate-bounce' },
        { expression: 'winking', bubble: '😉', tempClass: 'scale-105' },
        { expression: 'excited', bubble: '🥰', tempClass: 'scale-105 animate-bounce' },
      ],
      Energetic: [
        { expression: 'excited', bubble: '⚡', tempClass: 'animate-bounce scale-108' },
        { expression: 'starry_eyed', bubble: '🌟', tempClass: 'scale-105 brightness-115' },
        { expression: 'determined', bubble: '💪', tempClass: 'scale-102 font-bold' },
        { expression: 'giggling', bubble: '🎉', tempClass: 'animate-bounce' },
        { expression: 'winking', bubble: '✨', tempClass: 'scale-105' },
      ],
    };

    const interval = setInterval(() => {
      if (isAffectionActive) return;

      const pool = personalityPool[personality] || personalityPool['Playful'];
      if (Math.random() < 0.75) {
        const choice = pool[Math.floor(Math.random() * pool.length)];
        setExpression(choice.expression);
        setEmotionBubble(choice.bubble);
        setTemporaryClass(choice.tempClass);

        // Reset to default after 2.4s so Squishy looks naturally animated
        setTimeout(() => {
          setExpression((prev) => (prev === choice.expression ? 'default' : prev));
          setEmotionBubble((prev) => (prev === choice.bubble ? null : prev));
          setTemporaryClass((prev) => (prev === choice.tempClass ? '' : prev));
        }, 2400);
      }
    }, 4200);

    return () => clearInterval(interval);
  }, [isSleeping, personality, isAffectionActive]);

  // Immediate affection reaction when user pets or squishes Squishy
  const triggerAffection = () => {
    if (isSleeping) return;
    setIsAffectionActive(true);
    const affectionPool: { expression: SquishyExpression; bubble: string; tempClass: string }[] = [
      { expression: 'loving', bubble: '💖', tempClass: 'scale-115 animate-bounce' },
      { expression: 'giggling', bubble: '🥰', tempClass: 'scale-110 animate-bounce' },
      { expression: 'starry_eyed', bubble: '✨', tempClass: 'scale-115 brightness-115' },
      { expression: 'excited', bubble: '💕', tempClass: 'scale-110 animate-bounce' },
    ];
    const picked = affectionPool[Math.floor(Math.random() * affectionPool.length)];
    setExpression(picked.expression);
    setEmotionBubble(picked.bubble);
    setTemporaryClass(picked.tempClass);

    setTimeout(() => {
      setExpression('default');
      setEmotionBubble(null);
      setTemporaryClass('');
      setIsAffectionActive(false);
    }, 2500);
  };

  return {
    expression,
    emotionBubble,
    temporaryClass,
    triggerAffection,
  };
}

interface GrowthTransitionProps {
  prevLevel: number;
  newLevel: number;
  skin: SquishySkin;
  equippedHat?: string | null;
  equippedOutfit?: string | null;
  equippedAccessory?: string | null;
  onFinish: () => void;
}

export const GrowthTransition: React.FC<GrowthTransitionProps> = ({
  prevLevel,
  newLevel,
  skin,
  equippedHat,
  equippedOutfit,
  equippedAccessory,
  onFinish,
}) => {
  const [phase, setPhase] = useState<'charging' | 'metamorphosis' | 'triumphant'>('charging');
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  // Dynamic emotional expressions & classes during growing animation sequence
  const [growExpression, setGrowExpression] = useState<SquishyExpression>('curious');
  const [growBubble, setGrowBubble] = useState<string | null>('✨');
  const [growTempClass, setGrowTempClass] = useState<string>('animate-pulse scale-95');

  const prevConfig = LEVELS.find((l) => l.level === prevLevel) || LEVELS[0];
  const newConfig = LEVELS.find((l) => l.level === newLevel) || LEVELS[Math.min(newLevel - 1, LEVELS.length - 1)];

  // Particle-like div element specifications
  const risingParticles = [
    { id: 1, left: '10%', bottom: '25px', size: 10, bg: 'bg-pink-400', shadow: 'shadow-[0_0_12px_#f472b6]', delay: '0s' },
    { id: 2, left: '22%', bottom: '15px', size: 8, bg: 'bg-amber-300', shadow: 'shadow-[0_0_10px_#fde047]', delay: '0.3s' },
    { id: 3, left: '34%', bottom: '28px', size: 12, bg: 'bg-cyan-300', shadow: 'shadow-[0_0_14px_#67e8f9]', delay: '0.8s' },
    { id: 4, left: '46%', bottom: '12px', size: 9, bg: 'bg-purple-400', shadow: 'shadow-[0_0_10px_#c084fc]', delay: '0.2s' },
    { id: 5, left: '60%', bottom: '22px', size: 13, bg: 'bg-rose-400', shadow: 'shadow-[0_0_14px_#fb7185]', delay: '0.6s' },
    { id: 6, left: '74%', bottom: '16px', size: 8, bg: 'bg-yellow-300', shadow: 'shadow-[0_0_10px_#facc15]', delay: '0.4s' },
    { id: 7, left: '86%', bottom: '26px', size: 11, bg: 'bg-emerald-300', shadow: 'shadow-[0_0_12px_#6ee7b7]', delay: '1.0s' },
    { id: 8, left: '16%', bottom: '35px', size: 7, bg: 'bg-sky-400', shadow: 'shadow-[0_0_8px_#38bdf8]', delay: '1.2s' },
    { id: 9, left: '80%', bottom: '32px', size: 9, bg: 'bg-pink-300', shadow: 'shadow-[0_0_10px_#f472b6]', delay: '1.4s' },
  ];

  const diamondSparkleDivs = [
    { id: 10, left: '15%', top: '32%', size: 9, delay: '0.2s' },
    { id: 11, left: '82%', top: '25%', size: 12, delay: '0.5s' },
    { id: 12, left: '26%', top: '68%', size: 8, delay: '0.9s' },
    { id: 13, left: '76%', top: '64%', size: 10, delay: '0.1s' },
    { id: 14, left: '49%', top: '14%', size: 13, delay: '0.7s' },
    { id: 15, left: '88%', top: '48%', size: 8, delay: '1.1s' },
  ];

  const radialBurstParticles = [
    { id: 20, tx: '-90px', ty: '-80px', bg: 'bg-amber-300 shadow-[0_0_14px_#fde047]' },
    { id: 21, tx: '90px', ty: '-80px', bg: 'bg-pink-400 shadow-[0_0_14px_#f472b6]' },
    { id: 22, tx: '-110px', ty: '10px', bg: 'bg-cyan-300 shadow-[0_0_14px_#67e8f9]' },
    { id: 23, tx: '110px', ty: '10px', bg: 'bg-purple-400 shadow-[0_0_14px_#c084fc]' },
    { id: 24, tx: '-75px', ty: '85px', bg: 'bg-emerald-300 shadow-[0_0_14px_#86efac]' },
    { id: 25, tx: '75px', ty: '85px', bg: 'bg-yellow-300 shadow-[0_0_14px_#facc15]' },
    { id: 26, tx: '0px', ty: '-110px', bg: 'bg-rose-400 shadow-[0_0_16px_#fb7185]' },
    { id: 27, tx: '0px', ty: '95px', bg: 'bg-sky-300 shadow-[0_0_16px_#7dd3fc]' },
  ];

  useEffect(() => {
    // Phase 1 Audio & initial curious energy gathering
    sounds.playChime();
    setGrowExpression('curious');
    setGrowBubble('✨');
    setGrowTempClass('animate-pulse scale-95');

    // 0.7s: Squishy concentrates with determined energy
    const t0 = setTimeout(() => {
      setGrowExpression('determined');
      setGrowBubble('⚡');
      setGrowTempClass('scale-95 brightness-110');
    }, 700);

    // Phase 2: Metamorphosis burst after 1.4s
    const t1 = setTimeout(() => {
      setPhase('metamorphosis');
      setGrowExpression('surprised');
      setGrowBubble('🌟');
      setGrowTempClass('animate-bounce scale-110 brightness-125');
      sounds.playSquish();
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.52 },
      });
    }, 1400);

    // 2.1s: Starry-eyed awe as evolution crystalizes
    const t1b = setTimeout(() => {
      setGrowExpression('starry_eyed');
      setGrowBubble('💫');
      setGrowTempClass('scale-115 brightness-130 rotate-2');
    }, 2100);

    // Phase 3: Triumphant resolution after 2.8s
    const t2 = setTimeout(() => {
      setPhase('triumphant');
      setGrowExpression('excited');
      setGrowBubble('🎉');
      setGrowTempClass('animate-bounce scale-110');
      sounds.playLevelUp();
    }, 2800);

    // 3.5s: Pure celebratory joy & giggles
    const t2b = setTimeout(() => {
      setGrowExpression('giggling');
      setGrowBubble('👑');
      setGrowTempClass('scale-105');
    }, 3500);

    // Countdown second ticker
    const timerInterval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Auto-clear transition once the full animation completes after 4.2s
    const t3 = setTimeout(() => {
      onFinish();
    }, 4200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t1b);
      clearTimeout(t2);
      clearTimeout(t2b);
      clearTimeout(t3);
      clearInterval(timerInterval);
    };
  }, [onFinish]);

  return (
    <div className="relative w-full rounded-3xl p-5 overflow-hidden transition-all duration-700 bg-gradient-to-b from-purple-950/95 via-pink-950/90 to-amber-950/95 text-white shadow-2xl border-2 border-pink-300/80">
      {/* Background Shockwave Ring Divs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute w-52 h-52 rounded-full border-2 border-pink-400/80 animate-growth-shockwave pointer-events-none" />
        <div
          className="absolute w-40 h-40 rounded-full border-2 border-cyan-300/80 animate-growth-shockwave pointer-events-none"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute w-64 h-64 rounded-full border border-amber-300/60 animate-growth-shockwave pointer-events-none"
          style={{ animationDelay: '1.0s' }}
        />
        {/* Pulsing Chromatic Aura Halo Div */}
        <div className="absolute bottom-6 w-60 h-20 rounded-full bg-gradient-to-r from-pink-500/50 via-amber-300/60 to-purple-500/50 blur-xl animate-growth-halo pointer-events-none" />
      </div>

      {/* Rising Particle-like Div Elements */}
      {risingParticles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full animate-growth-particle pointer-events-none ${p.bg} ${p.shadow}`}
          style={{
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Diamond Sparkle Particle Div Elements */}
      {diamondSparkleDivs.map((d) => (
        <div
          key={d.id}
          className="absolute bg-white/95 rotate-45 shadow-[0_0_12px_#ffffff] animate-sparkle pointer-events-none"
          style={{
            left: d.left,
            top: d.top,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: d.delay,
          }}
        />
      ))}

      {/* Radial Burst Particle Div Elements during metamorphosis */}
      {phase !== 'charging' &&
        radialBurstParticles.map((b) => (
          <div
            key={b.id}
            className={`absolute w-3.5 h-3.5 rounded-full animate-growth-burst pointer-events-none ${b.bg}`}
            style={
              {
                left: 'calc(50% - 7px)',
                top: 'calc(50% - 7px)',
                '--tx': b.tx,
                '--ty': b.ty,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Header Banner */}
      <div className="relative z-10 text-center mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-amber-200 text-xs font-display font-extrabold uppercase tracking-widest shadow-sm">
          <span>✨</span>
          <span>
            {phase === 'charging'
              ? 'Absorbing Growth Nutrients...'
              : phase === 'metamorphosis'
              ? '⚡ METAMORPHOSIS BURST! ⚡'
              : '🎉 EVOLUTION COMPLETE! 🎉'}
          </span>
          <span>✨</span>
        </div>

        <h3 className="font-display font-extrabold text-xl text-white mt-1 drop-shadow-md">
          {phase === 'triumphant'
            ? `Squishy Evolved to Level ${newConfig.level}!`
            : 'Squishy is Growing!'}
        </h3>

        {/* Stage Comparison Pill */}
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-black/40 border border-white/20 text-xs font-semibold">
          <span className="text-stone-300">{prevConfig.stageLabel} (Lv.{prevLevel})</span>
          <span className="text-amber-400 font-bold">➔</span>
          <span className="text-rose-300 font-extrabold underline">{newConfig.stageLabel} (Lv.{newLevel})</span>
        </div>
      </div>

      {/* Squishy Visual Character Container with Keyframe Morph */}
      <div className="relative z-10 py-1 flex flex-col items-center justify-center">
        <div
          className={`transition-all duration-300 ease-out ${
            phase === 'metamorphosis' ? 'animate-growth-morph' : ''
          }`}
          style={{
            filter:
              phase === 'metamorphosis'
                ? 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.95)) brightness(1.2)'
                : 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))',
          }}
        >
          <SquishyView
            skin={skin}
            stage={phase === 'charging' ? prevConfig.stageName : newConfig.stageName}
            level={phase === 'charging' ? prevLevel : newLevel}
            equippedHat={equippedHat}
            equippedOutfit={equippedOutfit}
            equippedAccessory={equippedAccessory}
            isCelebrating={phase === 'triumphant'}
            expression={growExpression}
            emotionBubble={growBubble}
            temporaryClass={growTempClass}
            size={210}
            showPedestal={false}
          />
        </div>

        {/* Status Text */}
        <div className="mt-2 text-center px-4">
          {phase === 'charging' && (
            <p className="text-xs font-semibold text-rose-200 animate-pulse">
              Treats digested into pure vital stardust... Gathering energy!
            </p>
          )}
          {phase === 'metamorphosis' && (
            <p className="text-xs font-bold text-amber-200 animate-bounce">
              🌟 Bouncing and expanding! Jelly molecules realigning! 🌟
            </p>
          )}
          {phase === 'triumphant' && (
            <p className="text-xs font-bold text-emerald-200">
              {newConfig.unlockTitle}
            </p>
          )}
        </div>
      </div>

      {/* Auto-Clearing Progress Bar & Action Button */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/20">
        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-pink-400 via-amber-300 to-emerald-400 transition-all duration-1000"
            style={{ width: `${((4 - secondsRemaining) / 4) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-300 font-medium mb-2">
          <span>Auto-clearing transition in {secondsRemaining}s...</span>
          <span>{phase === 'triumphant' ? 'Ready!' : 'Playing...'}</span>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-2.5 rounded-full font-display font-extrabold text-xs tracking-wide transition-all btn-squish-gold text-stone-900 flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
        >
          <span>🎁</span>
          <span>{phase === 'triumphant' ? 'View Level Rewards & Unlocks' : 'Skip & Continue'}</span>
        </button>
      </div>
    </div>
  );
};

interface HomeTabProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onClaimDailyReward: () => void;
  growthEvent?: GrowthEvent | null;
  onFinishGrowthEvent?: (config: LevelConfig) => void;
  onNavigateTab?: (tab: 'home' | 'feed' | 'shop' | 'explore' | 'friends') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  gameState,
  onUpdateState,
  onClaimDailyReward,
  growthEvent,
  onFinishGrowthEvent,
  onNavigateTab,
}) => {
  const [isSleeping, setIsSleeping] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pettingStreak, setPettingStreak] = useState(0);
  const [manualGrowthActive, setManualGrowthActive] = useState(false);
  const [weather, setWeather] = useState<SimulatedWeather>('sunshine');
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Real-time simulated weather cycle
  useEffect(() => {
    // Determine initial weather based on current local minutes
    const currentMin = new Date().getMinutes();
    const weatherCycle: SimulatedWeather[] = ['sunshine', 'petals', 'rain', 'rainbow'];
    const initialIndex = Math.floor(currentMin / 15) % weatherCycle.length;
    setWeather(weatherCycle[initialIndex]);

    // Simulated dynamic weather shift every 75 seconds for a living, breathing world
    const interval = setInterval(() => {
      setWeather((prev) => {
        const nextIndex = (weatherCycle.indexOf(prev) + 1) % weatherCycle.length;
        return weatherCycle[nextIndex];
      });
    }, 75000);

    return () => clearInterval(interval);
  }, []);

  const handleCycleWeather = () => {
    const cycle: SimulatedWeather[] = ['sunshine', 'petals', 'rain', 'rainbow'];
    const nextIndex = (cycle.indexOf(weather) + 1) % cycle.length;
    const nextWeather = cycle[nextIndex];
    setWeather(nextWeather);

    // Weather audio and speech reactions
    if (nextWeather === 'rain') {
      sounds.playRaindrop();
      setActiveSpeech(
        gameState.equippedOutfit === 'outfit_froggy_raincoat'
          ? '“Pitter-patter! Glad I have my Froggy Raincoat on for the cozy raindrops! 🌧️🐸”'
          : '“Pitter-patter! Cozy raindrops are drumming outside! 🌧️”'
      );
    } else if (nextWeather === 'petals') {
      sounds.playPetalBreeze();
      setActiveSpeech('“A sweet cherry blossom petal just floated right onto my top-knot! 🌸”');
    } else if (nextWeather === 'sunshine') {
      sounds.playSunshineChime();
      setActiveSpeech('“Warm golden sunshine! My jelly surface is glowing like a gem! ☀️”');
    } else if (nextWeather === 'rainbow') {
      sounds.playChime();
      setActiveSpeech('“Look at the nursery sky! A double rainbow of sweet stardust! 🌈✨”');
    }
    setTimeout(() => setActiveSpeech(null), 3500);
  };

  // Hook for natural, living emotional expressions & reactions during idle state
  const {
    expression: idleExpression,
    emotionBubble: idleBubble,
    temporaryClass: idleClass,
    triggerAffection,
  } = useSquishyIdleEmotions(gameState.personality, isSleeping);

  const isGrowing = Boolean(growthEvent) || manualGrowthActive;

  const currentLevelConfig = LEVELS.find((l) => l.level === gameState.level) || LEVELS[0];

  const handleSquish = () => {
    sounds.playSquish();
    triggerAffection();
    const nextStreak = pettingStreak + 1;
    setPettingStreak(nextStreak);

    // Progress Pet daily mission
    const { updatedMissions } = updateMissionCategoryProgress(
      gameState.dailyMissions || DEFAULT_DAILY_MISSIONS,
      'pet',
      1
    );

    let newHappy = gameState.happiness;
    let newCoins = gameState.coins;

    if (nextStreak % 4 === 0) {
      // Boost happiness
      newHappy = Math.min(100, gameState.happiness + 3);
      newCoins = gameState.coins + 2;
      sounds.playCoin();
    }

    onUpdateState({
      happiness: newHappy,
      coins: newCoins,
      dailyMissions: updatedMissions,
    });

    const quotes = [
      '“Boiing! Squishy feels extra squishy and bouncy!”',
      '“*Happy jelly giggles!*”',
      '“Squishy squished into your hand lovingly!”',
      '“Sparkles of pure dumpling joy burst out!”',
      '“Squishy is so glad to be your best companion!”',
    ];
    setActiveSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    setTimeout(() => setActiveSpeech(null), 3000);
  };

  const handleToggleSleep = () => {
    sounds.playTap();
    setIsSleeping(!isSleeping);

    // Progress Sleep daily mission when tucking into nap
    const { updatedMissions } = updateMissionCategoryProgress(
      gameState.dailyMissions || DEFAULT_DAILY_MISSIONS,
      'sleep',
      1
    );

    if (!isSleeping) {
      sounds.playPet();
      setActiveSpeech('“Shhh... Squishy is taking a cozy marshmallow nap...”');
      // Nap recovery
      const newHappy = Math.min(100, gameState.happiness + 15);
      const newFullness = Math.max(20, gameState.fullness - 5);
      onUpdateState({
        happiness: newHappy,
        fullness: newFullness,
        dailyMissions: updatedMissions,
      });
    } else {
      setActiveSpeech('“Squishy woke up refreshed and full of vitality!”');
      onUpdateState({
        dailyMissions: updatedMissions,
      });
    }
    setTimeout(() => setActiveSpeech(null), 3000);
  };

  const colors: { id: SquishyColor; label: string; hex: string; skinId: any }[] = [
    { id: 'pink', label: 'Pink Dumpling', hex: '#ff6b9d', skinId: 'pink_glaze' },
    { id: 'purple', label: 'Lavender Berry', hex: '#c084fc', skinId: 'lavender_berry' },
    { id: 'blue', label: 'Sky Bubble', hex: '#38bdf8', skinId: 'sky_bubble' },
    { id: 'green', label: 'Mint Gummy', hex: '#4ade80', skinId: 'mint_gummy' },
    { id: 'yellow', label: 'Sunny Lemon', hex: '#facc15', skinId: 'sunny_lemon' },
    { id: 'rainbow', label: 'Rainbow Hologram', hex: '#f43f5e', skinId: 'rainbow_prism' },
  ];

  const personalities: SquishyPersonality[] = [
    'Playful',
    'Sleepy',
    'Energetic',
    'Curious',
    'Friendly',
  ];

  // Floating Emote Bubbles logic based on Squishy's current mood and needs
  interface EmoteBubbleDef {
    id: string;
    icon: string;
    label: string;
    subtext?: string;
    tooltip: string;
    style: string;
    animationClass: string;
    onClick: () => void;
  }

  let leftEmote: EmoteBubbleDef | null = null;
  let centerEmote: EmoteBubbleDef | null = null;
  let rightEmote: EmoteBubbleDef | null = null;

  if (isSleeping) {
    centerEmote = {
      id: 'sleep-dream',
      icon: '💤',
      label: 'Nap Time',
      subtext: 'Sweet dreams',
      tooltip: 'Squishy is taking a cozy marshmallow nap... Zzz',
      style: 'bg-indigo-950/85 text-purple-200 border-2 border-purple-300/80 shadow-[0_4px_16px_rgba(147,51,234,0.35)] ring-2 ring-purple-400/30',
      animationClass: 'animate-emote-center',
      onClick: () => {
        sounds.playChime();
        setActiveSpeech('“Shhh... Squishy is dreaming of giant fluffy marshmallows... Zzz”');
        setTimeout(() => setActiveSpeech(null), 3000);
      },
    };
  } else {
    // 1. Hunger Need (Left Emote Bubble)
    if (gameState.fullness <= 25) {
      leftEmote = {
        id: 'hunger-critical',
        icon: '🍙',
        label: 'Starving!',
        subtext: `${Math.round(gameState.fullness)}% • Feed me!`,
        tooltip: `Tummy empty (${Math.round(gameState.fullness)}%)! Tap to feed treats!`,
        style: 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white border-2 border-amber-200 shadow-[0_6px_20px_rgba(244,63,94,0.5)] ring-2 ring-rose-400/40',
        animationClass: 'animate-emote-urgent',
        onClick: () => {
          sounds.playMunch();
          setActiveSpeech('“*Tummy rumble rumble!* Squishy is starving! Please feed me treats! 🍙”');
          if (onNavigateTab) {
            setTimeout(() => onNavigateTab('feed'), 600);
          }
        },
      };
    } else if (gameState.fullness <= 50) {
      leftEmote = {
        id: 'hunger-moderate',
        icon: '🍓',
        label: 'Peckish',
        subtext: `${Math.round(gameState.fullness)}% • Treat?`,
        tooltip: `Fullness ${Math.round(gameState.fullness)}% • Tap to visit Feed Lab!`,
        style: 'bg-white/95 text-stone-800 border-2 border-rose-300 shadow-[0_4px_14px_rgba(244,114,182,0.3)] ring-1 ring-rose-200',
        animationClass: 'animate-emote-left',
        onClick: () => {
          sounds.playMunch();
          setActiveSpeech('“Squishy is craving sweet berry treats from the Feed Lab! 🍓”');
          if (onNavigateTab) {
            setTimeout(() => onNavigateTab('feed'), 700);
          }
        },
      };
    } else {
      leftEmote = {
        id: 'tummy-full',
        icon: '🧁',
        label: 'Tummy Full',
        subtext: `${Math.round(gameState.fullness)}% • Happy`,
        tooltip: `Fullness ${Math.round(gameState.fullness)}% • Well fed!`,
        style: 'bg-white/90 text-stone-700 border-2 border-emerald-300 shadow-[0_4px_12px_rgba(52,211,153,0.2)] ring-1 ring-emerald-200',
        animationClass: 'animate-emote-left',
        onClick: () => {
          sounds.playSquish();
          setActiveSpeech('“Squishy’s jelly belly is full and contented! ✨”');
          setTimeout(() => setActiveSpeech(null), 3000);
        },
      };
    }

    // 2. Mood & Attention / Happiness (Right Emote Bubble)
    if (gameState.happiness <= 35) {
      rightEmote = {
        id: 'mood-lonely',
        icon: '🥺',
        label: 'Needs Love',
        subtext: 'Tap to cuddle',
        tooltip: `Happiness is low (${Math.round(gameState.happiness)}%)! Tap to cuddle!`,
        style: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-pink-200 shadow-[0_6px_20px_rgba(219,39,119,0.4)] ring-2 ring-pink-400/40',
        animationClass: 'animate-emote-urgent',
        onClick: () => {
          sounds.playPet();
          triggerAffection();
          const newHappy = Math.min(100, gameState.happiness + 8);
          const newCoins = gameState.coins + 1;
          onUpdateState({ happiness: newHappy, coins: newCoins });
          setActiveSpeech('“*Happy jelly purrs!* Squishy feels so warm and loved! 🥰”');
          setTimeout(() => setActiveSpeech(null), 3500);
        },
      };
    } else if (gameState.happiness >= 80 && gameState.fullness >= 70) {
      rightEmote = {
        id: 'mood-thriving',
        icon: '💖',
        label: 'Super Happy!',
        subtext: 'Pure joy',
        tooltip: 'Squishy is feeling ecstatic and bursting with joy!',
        style: 'bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 text-white border-2 border-white shadow-[0_6px_18px_rgba(244,63,94,0.35)] ring-2 ring-pink-300/60',
        animationClass: 'animate-emote-right',
        onClick: () => {
          sounds.playCoin();
          triggerAffection();
          onUpdateState({ coins: gameState.coins + 1 });
          setActiveSpeech('“Sparkles of pure happiness burst out! Squishy loves you! ✨”');
          setTimeout(() => setActiveSpeech(null), 3000);
        },
      };
    } else {
      // Personality desires
      const personalityMap: Record<
        SquishyPersonality,
        { icon: string; label: string; subtext: string; tooltip: string; quote: string }
      > = {
        Playful: {
          icon: '🎾',
          label: 'Playful!',
          subtext: 'Tap to bounce',
          tooltip: 'Squishy wants to bounce and play with toys!',
          quote: '“Boiing boiing! Tap Squishy for bouncy squish fun! 🎾”',
        },
        Curious: {
          icon: '🔍',
          label: 'Curious!',
          subtext: 'Exploring',
          tooltip: 'Squishy is observing everything with big sparkly eyes!',
          quote: '“Squishy is curious what amazing treasures await today! 🔍”',
        },
        Energetic: {
          icon: '⚡',
          label: 'Bouncy Zoom!',
          subtext: 'High turbo',
          tooltip: 'High energy! Squishy has turbo bounce in its step!',
          quote: '“Zoom! Squishy can’t stop bouncing on the soft cushion! ⚡”',
        },
        Friendly: {
          icon: '🌸',
          label: 'Best Friends',
          subtext: 'Cozy bond',
          tooltip: 'Squishy loves spending sweet companion time with you!',
          quote: '“Squishy snuggles close and gives you sweet dumpling love! 🌸”',
        },
        Sleepy: {
          icon: '☁️',
          label: 'Dreamy',
          subtext: 'Cozy mood',
          tooltip: 'Relaxed and calm... Ready for nap time whenever!',
          quote: '“*Soft yawn...* That marshmallow bed looks so cozy... ☁️”',
        },
      };

      const p = personalityMap[gameState.personality] || personalityMap.Playful;
      rightEmote = {
        id: 'personality-mood',
        icon: p.icon,
        label: p.label,
        subtext: p.subtext,
        tooltip: p.tooltip,
        style: 'bg-white/95 text-stone-800 border-2 border-pink-300 shadow-[0_4px_14px_rgba(244,114,182,0.25)] ring-1 ring-pink-200',
        animationClass: 'animate-emote-right',
        onClick: () => {
          sounds.playSquish();
          triggerAffection();
          setActiveSpeech(p.quote);
          setTimeout(() => setActiveSpeech(null), 3000);
        },
      };
    }
  }

  return (
    <div
      className={`pb-32 max-w-md mx-auto px-4 pt-1 transition-colors duration-700 ${
        isSleeping ? 'bg-indigo-950/20 rounded-3xl' : ''
      }`}
    >
      {/* Top Welcome Title */}
      <div className="text-center mb-1">
        <span className="font-display font-black text-stone-400 text-[11px] tracking-widest uppercase">
          Cozy Nursery
        </span>
        <h2 className="font-display font-extrabold text-xl text-stone-900 flex items-center justify-center gap-1.5">
          <span>🌸</span> {gameState.squishyName}&apos;s Sanctuary <span>✨</span>
        </h2>
      </div>

      {/* Main Nursery Room Visual Area or Specialized Growth Transition State */}
      {isGrowing ? (
        <div className="mb-4 animate-fadeIn">
          <GrowthTransition
            prevLevel={growthEvent?.prevLevel ?? Math.max(1, gameState.level - 1)}
            newLevel={growthEvent?.newLevel ?? gameState.level}
            skin={gameState.skin}
            equippedHat={gameState.equippedHat}
            equippedOutfit={gameState.equippedOutfit}
            equippedAccessory={gameState.equippedAccessory}
            onFinish={() => {
              if (growthEvent) {
                if (onFinishGrowthEvent) {
                  onFinishGrowthEvent(growthEvent.levelConfig);
                }
              } else {
                setManualGrowthActive(false);
              }
            }}
          />
        </div>
      ) : (
        <div
          className={`jelly-pod rounded-3xl p-5 mb-4 relative overflow-hidden transition-all duration-500 ${
            isSleeping
              ? 'bg-gradient-to-b from-indigo-900/60 to-purple-900/60 text-white'
              : 'bg-gradient-to-b from-white/95 to-rose-50/70'
          }`}
        >
          {/* Animated Simulated Weather Background Layer behind Squishy */}
          <WeatherBackground weather={weather} isSleeping={isSleeping} />

          {/* Room Header Controls */}
          <div className="flex items-center justify-between mb-2 relative z-20">
            {/* Personality pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⭐</span>
              <select
                value={gameState.personality}
                onChange={(e) => {
                  sounds.playTap();
                  onUpdateState({ personality: e.target.value as SquishyPersonality });
                }}
                className="text-xs font-display font-bold bg-white/90 border border-stone-200 text-stone-800 rounded-full px-2.5 py-0.5 shadow-2xs cursor-pointer focus:outline-none"
              >
                {personalities.map((p) => (
                  <option key={p} value={p}>
                    {p} Mood
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Simulated Weather Condition Toggle Button */}
              <button
                type="button"
                onClick={handleCycleWeather}
                className="px-2.5 py-1 rounded-full font-display font-bold text-xs flex items-center gap-1.5 border bg-white/90 text-stone-700 border-stone-200 hover:bg-stone-50 shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Simulated Real-Time Weather • Click to change atmosphere"
              >
                <span>
                  {weather === 'sunshine'
                    ? '☀️'
                    : weather === 'rain'
                    ? '🌧️'
                    : weather === 'petals'
                    ? '🌸'
                    : '🌈'}
                </span>
                <span className="capitalize">{weather}</span>
              </button>

              {/* Nap / Light Switch Button */}
              <button
                onClick={handleToggleSleep}
                className={`px-3 py-1 rounded-full font-display font-bold text-xs flex items-center gap-1.5 border transition-all ${
                  isSleeping
                    ? 'bg-amber-400 text-stone-900 border-amber-300 shadow-md scale-105'
                    : 'bg-white/90 text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{isSleeping ? '☀️ Wake Up' : '🌙 Nap Time'}</span>
              </button>
            </div>
          </div>

          {/* Squishy Speech Bubble with optional quick Feed shortcut */}
          {activeSpeech && (
            <div className="absolute top-12 left-4 right-4 z-30 bg-white/95 backdrop-blur-md text-stone-800 border-2 border-pink-300 rounded-2xl p-2.5 shadow-xl text-xs font-bold text-center animate-bounce flex flex-col items-center gap-1.5">
              <span>{activeSpeech}</span>
              {onNavigateTab && gameState.fullness <= 50 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onNavigateTab('feed');
                  }}
                  className="px-3 py-1 rounded-full btn-squish-primary text-white text-[11px] font-display font-extrabold flex items-center gap-1 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                >
                  <span>🍼</span> Open Feed Lab ➔
                </button>
              )}
            </div>
          )}

          {/* Center Squishy Interactive Room Model with Floating Emote Bubbles */}
          <div className="py-2 flex flex-col items-center justify-center relative min-h-[290px]">
            {/* Floating Emote Bubbles Container above Squishy */}
            <div className="absolute top-0 left-1 right-1 z-20 pointer-events-none flex items-start justify-between px-1">
              {/* Left Floating Emote (Hunger / Fullness Need) */}
              {leftEmote ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    leftEmote!.onClick();
                  }}
                  className={`pointer-events-auto cursor-pointer group transition-all transform active:scale-95 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md hover:shadow-lg ${leftEmote.style} ${leftEmote.animationClass}`}
                  title={leftEmote.tooltip}
                >
                  <span className="text-base group-hover:scale-125 transition-transform drop-shadow-xs">
                    {leftEmote.icon}
                  </span>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-display font-extrabold text-[11px] tracking-wide whitespace-nowrap">
                      {leftEmote.label}
                    </span>
                    {leftEmote.subtext && (
                      <span className="text-[9px] font-semibold opacity-90 whitespace-nowrap">
                        {leftEmote.subtext}
                      </span>
                    )}
                  </div>
                </button>
              ) : (
                <div />
              )}

              {/* Center Floating Emote (Nap / Sleep Dreaming) */}
              {centerEmote && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    centerEmote!.onClick();
                  }}
                  className={`pointer-events-auto cursor-pointer group transition-all transform active:scale-95 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-md hover:shadow-lg ${centerEmote.style} ${centerEmote.animationClass}`}
                  title={centerEmote.tooltip}
                >
                  <span className="text-base group-hover:scale-125 transition-transform drop-shadow-xs">
                    {centerEmote.icon}
                  </span>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-display font-extrabold text-[11px] tracking-wide whitespace-nowrap">
                      {centerEmote.label}
                    </span>
                    {centerEmote.subtext && (
                      <span className="text-[9px] font-semibold opacity-90 whitespace-nowrap">
                        {centerEmote.subtext}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Right Floating Emote (Mood / Attention / Desires) */}
              {rightEmote ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    rightEmote!.onClick();
                  }}
                  className={`pointer-events-auto cursor-pointer group transition-all transform active:scale-95 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md hover:shadow-lg ${rightEmote.style} ${rightEmote.animationClass}`}
                  title={rightEmote.tooltip}
                >
                  <span className="text-base group-hover:scale-125 transition-transform drop-shadow-xs">
                    {rightEmote.icon}
                  </span>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-display font-extrabold text-[11px] tracking-wide whitespace-nowrap">
                      {rightEmote.label}
                    </span>
                    {rightEmote.subtext && (
                      <span className="text-[9px] font-semibold opacity-90 whitespace-nowrap">
                        {rightEmote.subtext}
                      </span>
                    )}
                  </div>
                </button>
              ) : (
                <div />
              )}
            </div>

            <SquishyView
              skin={gameState.skin}
              stage={currentLevelConfig.stageName}
              level={gameState.level}
              equippedHat={gameState.equippedHat}
              equippedOutfit={gameState.equippedOutfit}
              equippedAccessory={gameState.equippedAccessory}
              isSleeping={isSleeping}
              expression={idleExpression}
              emotionBubble={idleBubble}
              temporaryClass={idleClass}
              onSquish={handleSquish}
              size={230}
              showPedestal={true}
            />

            {/* Squish prompt pill */}
            <div className="mt-2 text-xs font-display font-extrabold text-stone-600 bg-white/80 border border-stone-200 px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <span>👆</span> Tap or poke Squishy to squish!
            </div>
          </div>

          {/* Room Comfort Rating Bar (Level 6 Feature) */}
          <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between text-xs gap-1 flex-wrap">
            <div className="flex items-center gap-1 text-stone-600 font-bold">
              <span>🏡</span>
              <span>Comfort:</span>
              <span className="text-rose-600 font-display font-extrabold">
                {gameState.comfortLevel} pts
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Specialized Growing Animation Trigger */}
              <button
                onClick={() => {
                  sounds.playSquish();
                  setManualGrowthActive(true);
                }}
                className="text-[11px] font-display font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs"
                title="Watch Squishy's specialized growth transformation animation"
              >
                <span>✨</span> Evolution FX
              </button>

              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-[11px] font-display font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200"
              >
                <span>🎨</span> Color
              </button>
            </div>
          </div>

          {/* Color Palette Picker Drawer */}
          {showColorPicker && (
            <div className="mt-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm animate-fadeIn">
              <span className="text-[11px] font-display font-bold text-stone-500 block mb-2">
                Select Squishy’s Jelly Hue:
              </span>
              <div className="flex items-center justify-between gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      sounds.playSquish();
                      onUpdateState({ color: c.id, skin: c.skinId });
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform shadow-xs ${
                      gameState.color === c.id
                        ? 'border-stone-900 scale-110 ring-2 ring-pink-300'
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  >
                    {gameState.color === c.id && (
                      <span className="text-white text-xs font-bold drop-shadow">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Streak Calendar Component */}
      <StreakCalendar
        gameState={gameState}
        onUpdateState={onUpdateState}
        onRewardClaimed={(coins, gems, day) => {
          triggerAffection();
          setActiveSpeech(
            `“🎉 Woohoo! Day ${day} Streak claimed! Collected +${coins} 🪙 and +${gems} 💎! Keep the streak alive! 🔥”`
          );
          setTimeout(() => setActiveSpeech(null), 4000);
        }}
      />

      {/* Daily Missions System Component */}
      <DailyMissionsCard
        gameState={gameState}
        onUpdateState={onUpdateState}
        onNavigateTab={onNavigateTab}
        onPetSquishy={handleSquish}
        onNapToggle={handleToggleSleep}
        onMissionClaimed={(mission) => {
          triggerAffection();
          setActiveSpeech(
            `“🌟 Mission Complete! ${mission.title}! Collected +${mission.rewardCoins} Coins! Amazing job! ✨”`
          );
          setTimeout(() => setActiveSpeech(null), 3500);
        }}
      />

      {/* Memory Journal Section */}
      <JournalCard
        gameState={gameState}
        onOpenJournal={() => setShowJournalModal(true)}
      />

      {/* Quick Action Activity Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Pet & Tickle */}
        <div
          onClick={handleSquish}
          className="jelly-card rounded-2xl p-3 cursor-pointer hover:border-pink-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🪶</span>
            <div>
              <h4 className="font-display font-extrabold text-xs text-stone-900">
                Tickle Belly
              </h4>
              <p className="text-[10px] text-stone-500 font-semibold">Giggles & joy boost</p>
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-2 py-1 rounded-full btn-squish-primary font-display font-bold text-[11px] text-white cursor-pointer"
          >
            Tickle!
          </button>
        </div>

        {/* Meadow Walk / Treat Lab Shortcut */}
        <div
          onClick={() => {
            sounds.playTap();
            if (onNavigateTab) {
              onNavigateTab(gameState.level >= 4 ? 'explore' : 'feed');
            }
          }}
          className="jelly-card rounded-2xl p-3 cursor-pointer hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{gameState.level >= 4 ? '🌿' : '🍼'}</span>
            <div>
              <h4 className="font-display font-extrabold text-xs text-stone-900">
                {gameState.level >= 4 ? 'Meadow Walk' : 'Treat Lab'}
              </h4>
              <p className="text-[10px] text-stone-500 font-semibold">
                {gameState.level >= 4 ? 'Forage for coins' : 'Feed yummy snacks'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-2 py-1 rounded-full btn-squish-cyan font-display font-bold text-[11px] text-stone-900 cursor-pointer"
          >
            {gameState.level >= 4 ? 'Explore ➔' : 'Feed ➔'}
          </button>
        </div>
      </div>

      {/* Squishy Bond & Stats Card */}
      <div className="jelly-card rounded-2xl p-3.5 space-y-2.5">
        <h4 className="font-display font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <span>💖</span> Pet Vitality & Bond
        </h4>

        {/* Happiness */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-stone-600">Happiness</span>
            <span className="text-rose-600 font-extrabold">{gameState.happiness}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all"
              style={{ width: `${gameState.happiness}%` }}
            />
          </div>
        </div>

        {/* Fullness */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-stone-600">Fullness</span>
            <span className="text-amber-600 font-extrabold">{gameState.fullness}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all"
              style={{ width: `${gameState.fullness}%` }}
            />
          </div>
        </div>

        {/* Friendship Heart Bond */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-stone-600">Companion Friendship</span>
            <span className="text-purple-600 font-extrabold">{gameState.friendship}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all"
              style={{ width: `${gameState.friendship}%` }}
            />
          </div>
        </div>
      </div>

      {/* Memory Journal Scrapbook Modal */}
      <JournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        gameState={gameState}
        onUpdateState={onUpdateState}
      />
    </div>
  );
};
