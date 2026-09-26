/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, FoodItem, ShopItem, LevelConfig } from './types/game';
import { FOREST_FRIENDS, LEVELS } from './data/gameData';
import { sounds } from './utils/audio';
import { DeviceFrame } from './components/DeviceFrame';
import { TopBar } from './components/TopBar';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { FeedTab } from './components/FeedTab';
import { ShopTab } from './components/ShopTab';
import { ExploreTab } from './components/ExploreTab';
import { FriendsTab } from './components/FriendsTab';
import { LevelUpModal } from './components/LevelUpModal';
import { PrologueModal } from './components/PrologueModal';
import { CompanionModal } from './components/CompanionModal';
import { calculateStreakStatus, getTodayDateString } from './data/streakData';
import {
  DEFAULT_DAILY_MISSIONS,
  getInitialOrRefreshedMissions,
  updateMissionCategoryProgress,
} from './data/missionsData';
import { INITIAL_JOURNAL_ENTRIES, addJournalEntry } from './data/journalData';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'squishy_game_save_v1';

const INITIAL_STATE: GameState = {
  squishyName: 'Squishy',
  level: 3, // Starting at Level 3 as showcased in user mocks
  xp: 780,  // 780 / 1000 XP as in Image 5!
  happiness: 98,
  fullness: 82,
  friendship: 65,
  personality: 'Playful',
  color: 'pink',
  skin: 'pink_glaze',
  coins: 2450, // 2,450 coins matching Image 5 & 7!
  gems: 180,   // 180 gems matching Image 5 & 7!

  equippedHat: 'hat_strawberry_beret',
  equippedOutfit: null,
  equippedAccessory: 'acc_star_bowtie',
  equippedToy: null,

  inventoryItems: [
    'hat_strawberry_beret',
    'acc_star_bowtie',
    'food_rice_dumpling',
    'food_strawberry_glaze',
    'home_cloud_rug',
  ],

  roomDecor: {
    bed: 'home_marshmallow_bed',
    rug: 'home_cloud_rug',
    lamp: 'home_starlight_garland',
    wallpaper: 'Rainbow Wallpaper',
    plant: 'home_sakura_plant',
  },

  skills: {
    strength: 35,
    speed: 40,
    jump: 45,
    smell: 30,
    swimming: 25,
  },

  friends: FOREST_FRIENDS,

  hasCompletedPrologue: false,
  hasCompletedLevel10Adventure: false,
  adventurePartsCollected: 1,

  lastFedTime: Date.now(),
  comfortLevel: 45,

  dailyStreak: 1,
  maxStreak: 1,
  lastStreakClaimDate: null,

  dailyMissions: DEFAULT_DAILY_MISSIONS,
  dailyMissionsDate: getTodayDateString(),
  dailyMissionsBonusClaimed: false,

  journalEntries: INITIAL_JOURNAL_ENTRIES,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const refreshed = getInitialOrRefreshedMissions(
          parsed.dailyMissions,
          parsed.dailyMissionsDate
        );
        return {
          ...INITIAL_STATE,
          ...parsed,
          dailyMissions: refreshed.missions,
          dailyMissionsDate: refreshed.date,
          dailyMissionsBonusClaimed:
            parsed.dailyMissionsDate === refreshed.date
              ? (parsed.dailyMissionsBonusClaimed ?? false)
              : false,
          journalEntries:
            parsed.journalEntries && parsed.journalEntries.length > 0
              ? parsed.journalEntries
              : INITIAL_JOURNAL_ENTRIES,
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATE;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('feed');
  const [levelUpConfig, setLevelUpConfig] = useState<LevelConfig | null>(null);
  const [growthEvent, setGrowthEvent] = useState<{
    prevLevel: number;
    newLevel: number;
    levelConfig: LevelConfig;
  } | null>(null);
  const [showPrologue, setShowPrologue] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore storage errors
    }
  }, [gameState]);

  // Show prologue on initial launch if not completed
  useEffect(() => {
    if (!gameState.hasCompletedPrologue && gameState.level === 1) {
      setShowPrologue(true);
    }
  }, [gameState.hasCompletedPrologue, gameState.level]);

  // Handle Feeding Squishy
  const handleFeedSquishy = (food: FoodItem) => {
    let newCoins = gameState.coins;
    let newGems = gameState.gems;

    if (food.currency === 'coins') {
      newCoins = Math.max(0, newCoins - food.cost);
    } else {
      newGems = Math.max(0, newGems - food.cost);
    }

    const newXp = gameState.xp + food.xpGain;
    const newHappy = Math.min(100, gameState.happiness + food.happinessGain);
    const newFullness = Math.min(100, gameState.fullness + 18);

    // Progress Feed daily mission
    const { updatedMissions } = updateMissionCategoryProgress(
      gameState.dailyMissions || DEFAULT_DAILY_MISSIONS,
      'feed',
      1
    );

    // Check Level Up
    const currentConfig = LEVELS.find((l) => l.level === gameState.level) || LEVELS[0];
    if (newXp >= currentConfig.requiredXp && gameState.level < 10) {
      const nextLevel = gameState.level + 1;
      const nextConfig = LEVELS.find((l) => l.level === nextLevel);

      if (nextConfig) {
        // Trigger specialized visual growing transition in HomeTab
        const prevLvl = gameState.level;
        setCurrentTab('home');
        setGrowthEvent({
          prevLevel: prevLvl,
          newLevel: nextLevel,
          levelConfig: nextConfig,
        });

        const updatedJournal = addJournalEntry(
          gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
          'levelup',
          `Grew to Level ${nextLevel}!`,
          `Squishy transformed into a ${nextConfig.stageLabel} Squishy! Unlocked: ${nextConfig.unlockTitle}`,
          '🌟',
          true
        );

        setGameState((prev) => ({
          ...prev,
          level: nextLevel,
          xp: Math.max(0, newXp - currentConfig.requiredXp),
          happiness: 100,
          fullness: newFullness,
          coins: newCoins + 100,
          gems: newGems + 10,
          dailyMissions: updatedMissions,
          journalEntries: updatedJournal,
        }));
        return;
      }
    }

    setGameState((prev) => ({
      ...prev,
      xp: newXp,
      happiness: newHappy,
      fullness: newFullness,
      coins: newCoins,
      gems: newGems,
      lastFedTime: Date.now(),
      dailyMissions: updatedMissions,
    }));
  };

  // Buy or Equip Item in Boutique
  const handleBuyOrEquipItem = (item: ShopItem) => {
    const isOwned = gameState.inventoryItems.includes(item.id);
    let newCoins = gameState.coins;
    let newGems = gameState.gems;
    const newInventory = [...gameState.inventoryItems];

    if (!isOwned) {
      if (item.currency === 'coins') {
        newCoins = Math.max(0, newCoins - item.cost);
      } else {
        newGems = Math.max(0, newGems - item.cost);
      }
      newInventory.push(item.id);
      sounds.playCoin();
    } else {
      sounds.playSquish();
    }

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'outfit',
      `Equipped ${item.name}`,
      `Squishy styled a fresh look in the nursery: ${item.description}`,
      item.icon || '🎀'
    );

    // Equip into correct slot
    const updates: Partial<GameState> = {
      coins: newCoins,
      gems: newGems,
      inventoryItems: newInventory,
      journalEntries: updatedJournal,
    };

    if (item.category === 'hats') {
      updates.equippedHat = gameState.equippedHat === item.id ? null : item.id;
    } else if (item.category === 'outfits') {
      updates.equippedOutfit = gameState.equippedOutfit === item.id ? null : item.id;
    } else if (item.category === 'accessories') {
      updates.equippedAccessory = gameState.equippedAccessory === item.id ? null : item.id;
    } else if (item.category === 'toys') {
      updates.equippedToy = item.id;
    } else if (item.category === 'skins') {
      updates.skin = item.id.replace('skin_', '') as any;
    } else if (item.category === 'home') {
      updates.comfortLevel = gameState.comfortLevel + 15;
    }

    setGameState((prev) => ({ ...prev, ...updates }));
  };

  const handleUnequipSlot = (slot: 'hat' | 'outfit' | 'accessory' | 'toy' | 'skin') => {
    sounds.playTap();
    if (slot === 'hat') setGameState((p) => ({ ...p, equippedHat: null }));
    if (slot === 'outfit') setGameState((p) => ({ ...p, equippedOutfit: null }));
    if (slot === 'accessory') setGameState((p) => ({ ...p, equippedAccessory: null }));
    if (slot === 'toy') setGameState((p) => ({ ...p, equippedToy: null }));
    if (slot === 'skin') setGameState((p) => ({ ...p, skin: 'pink_glaze' }));
  };

  // Claim Daily Treat Reward via streak system
  const handleClaimDailyReward = () => {
    sounds.playLevelUp();
    sounds.playCoin();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.65 },
    });

    const status = calculateStreakStatus(
      gameState.dailyStreak ?? 1,
      gameState.lastStreakClaimDate ?? null
    );

    const reward = status.todayReward;
    const newStreak = status.totalStreak;
    const newMaxStreak = Math.max(gameState.maxStreak ?? 1, newStreak);
    const todayStr = getTodayDateString();

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'streak',
      `Day ${status.currentDayInCycle} Streak Claimed!`,
      `Maintained the daily login streak! Claimed ${reward.bonusTitle} (+${reward.coins} Coins, +${reward.gems} Gems).`,
      '🔥',
      status.currentDayInCycle === 7
    );

    setGameState((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + reward.coins,
      gems: (prev.gems || 0) + reward.gems,
      happiness: 100,
      dailyStreak: newStreak,
      maxStreak: newMaxStreak,
      lastStreakClaimDate: todayStr,
      journalEntries: updatedJournal,
    }));
  };

  // Jump to level (for review / testing)
  const handleJumpToLevel = (lvl: number) => {
    const config = LEVELS.find((l) => l.level === lvl);
    if (!config) return;
    const prevLvl = gameState.level;
    setShowCompanion(false);
    setCurrentTab('home');
    setGrowthEvent({
      prevLevel: prevLvl,
      newLevel: lvl,
      levelConfig: config,
    });

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'levelup',
      `Growth Milestone: Level ${lvl}!`,
      `Squishy grew into ${config.stageLabel} Squishy! Unlocked: ${config.unlockTitle}`,
      '🌟',
      true
    );

    setGameState((prev) => ({
      ...prev,
      level: lvl,
      xp: Math.round(config.requiredXp * 0.7),
      happiness: 100,
      journalEntries: updatedJournal,
    }));
  };

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <DeviceFrame>
      {/* Top Status Bar matching Image 5 & Image 7 */}
      <TopBar
        level={gameState.level}
        coins={gameState.coins}
        gems={gameState.gems}
        happiness={gameState.happiness}
        squishyName={gameState.squishyName}
        onOpenCompanionChat={() => setShowCompanion(true)}
        onClaimFreeGift={handleClaimDailyReward}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Tab Screens */}
      <main className="flex-1 overflow-y-auto no-scrollbar pt-2">
        {currentTab === 'home' && (
          <HomeTab
            gameState={gameState}
            onUpdateState={(partial) => setGameState((p) => ({ ...p, ...partial }))}
            onClaimDailyReward={handleClaimDailyReward}
            growthEvent={growthEvent}
            onFinishGrowthEvent={(config) => {
              setGrowthEvent(null);
              setLevelUpConfig(config);
            }}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'feed' && (
          <FeedTab
            gameState={gameState}
            onFeedSquishy={handleFeedSquishy}
          />
        )}

        {currentTab === 'shop' && (
          <ShopTab
            gameState={gameState}
            onBuyOrEquipItem={handleBuyOrEquipItem}
            onUnequipSlot={handleUnequipSlot}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreTab
            gameState={gameState}
            onUpdateState={(partial) => setGameState((p) => ({ ...p, ...partial }))}
            onLevelUpBonus={() => handleJumpToLevel(Math.min(10, gameState.level + 1))}
          />
        )}

        {currentTab === 'friends' && (
          <FriendsTab
            gameState={gameState}
            onUpdateState={(partial) => setGameState((p) => ({ ...p, ...partial }))}
          />
        )}
      </main>

      {/* Bottom Floating Tactile Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        feedNotification={gameState.fullness < 40}
      />

      {/* Level Up Celebration Modal */}
      {levelUpConfig && (
        <LevelUpModal
          levelConfig={levelUpConfig}
          skin={gameState.skin}
          onClose={() => setLevelUpConfig(null)}
        />
      )}

      {/* Level 1 Birth Prologue Modal */}
      {showPrologue && (
        <PrologueModal
          onClose={() => {
            setShowPrologue(false);
            setGameState((p) => ({ ...p, hasCompletedPrologue: true }));
          }}
        />
      )}

      {/* Companion Guide Leo Dialog (Image 2) */}
      {showCompanion && (
        <CompanionModal
          level={gameState.level}
          squishyName={gameState.squishyName}
          onJumpToLevel={handleJumpToLevel}
          onClose={() => setShowCompanion(false)}
        />
      )}
    </DeviceFrame>
  );
}
