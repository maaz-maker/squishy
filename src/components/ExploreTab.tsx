import React, { useState } from 'react';
import { GameState } from '../types/game';
import { EXPLORATION_ZONES } from '../data/gameData';
import { sounds } from '../utils/audio';
import { updateMissionCategoryProgress, DEFAULT_DAILY_MISSIONS } from '../data/missionsData';
import { addJournalEntry, INITIAL_JOURNAL_ENTRIES } from '../data/journalData';
import confetti from 'canvas-confetti';

interface ExploreTabProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onLevelUpBonus: () => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  gameState,
  onUpdateState,
}) => {
  const [selectedZone, setSelectedZone] = useState(EXPLORATION_ZONES[0]);
  const [forageResult, setForageResult] = useState<string | null>(null);
  const [adventureStep, setAdventureStep] = useState(gameState.adventurePartsCollected || 0);
  const [showChestModal, setShowChestModal] = useState(false);

  const handleForage = () => {
    sounds.playSquish();
    const item =
      selectedZone.collectibles[
        Math.floor(Math.random() * selectedZone.collectibles.length)
      ];
    const gainedCoins = selectedZone.scavengerRewards.coins;
    const gainedXp = selectedZone.scavengerRewards.xp;

    const newCoins = gameState.coins + gainedCoins;
    const newXp = gameState.xp + gainedXp;
    const newHappy = Math.min(100, gameState.happiness + 5);

    sounds.playCoin();

    // Progress explore daily mission
    const { updatedMissions } = updateMissionCategoryProgress(
      gameState.dailyMissions || DEFAULT_DAILY_MISSIONS,
      'explore',
      1
    );

    const updatedJournal = addJournalEntry(
      gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
      'explore',
      `Found ${item}!`,
      `Foraged in ${selectedZone.name}! Collected precious item, +${gainedCoins} Coins and +${gainedXp} XP.`,
      '💎',
      true
    );

    onUpdateState({
      coins: newCoins,
      xp: newXp,
      happiness: newHappy,
      dailyMissions: updatedMissions,
      journalEntries: updatedJournal,
    });

    setForageResult(`Found a ${item}! +${gainedCoins} Coins, +${gainedXp} XP!`);
    setTimeout(() => setForageResult(null), 3000);
  };

  const handleAdvanceAdventure = () => {
    sounds.playChime();
    const nextStep = adventureStep + 1;
    setAdventureStep(nextStep);
    onUpdateState({ adventurePartsCollected: nextStep });

    if (nextStep >= 4) {
      // Completed The Big Adventure!
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setShowChestModal(true);

      const updatedJournal = addJournalEntry(
        gameState.journalEntries || INITIAL_JOURNAL_ENTRIES,
        'adventure',
        'Saved the Meadow!',
        'Completed the legendary forest adventure! Rewarded with Galaxy Stardust skin & Star Tiara.',
        '🏆',
        true
      );

      onUpdateState({
        hasCompletedLevel10Adventure: true,
        coins: gameState.coins + 500,
        gems: gameState.gems + 50,
        inventoryItems: [...gameState.inventoryItems, 'skin_galaxy_stardust', 'hat_star_tiara'],
        journalEntries: updatedJournal,
      });
    }
  };

  const adventureTasks = [
    { title: 'Clear Fallen Caramel Trees', desc: 'Use Squishy’s jelly bounce to unblock the meadow path.', icon: '🪵' },
    { title: 'Repair Windmill of Whispers', desc: 'Fix the candy sails to spin gentle mountain breezes.', icon: '🛖' },
    { title: 'Collect 4 Prismatic Shards', desc: 'Find starlight gems scattered by the tempest.', icon: '💎' },
    { title: 'Brew the Golden Sun Potion', desc: 'Channel warm sunshine to banish gloomy storm clouds.', icon: '🍯' },
  ];

  return (
    <div className="pb-32 max-w-md mx-auto px-4 pt-1 animate-fadeIn">
      {/* Subtitle */}
      <div className="text-center font-display font-black text-stone-400 text-[11px] tracking-widest uppercase mb-1">
        World Exploration
      </div>

      <div className="text-center mb-3">
        <h2 className="font-display font-extrabold text-lg text-stone-900 flex items-center justify-center gap-1.5">
          <span>🧭</span> Valley of Whispers <span>✨</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          Take Squishy on scenic foraging walks and expeditions
        </p>
      </div>

      {/* Level 10 Major Adventure Banner */}
      <div className="jelly-pod rounded-3xl p-4 mb-4 border-2 border-purple-200/80 bg-gradient-to-r from-purple-100/80 via-pink-100/70 to-amber-100/70 relative overflow-hidden shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">⚡</span>
            <div>
              <span className="text-[10px] font-display font-black text-purple-700 uppercase tracking-wider">
                Level 10 Major Story Event
              </span>
              <h3 className="font-display font-extrabold text-sm text-stone-900">
                The Rainbow Tempest Adventure
              </h3>
            </div>
          </div>
          <span className="text-xs font-display font-extrabold text-purple-700 bg-white/90 px-2 py-0.5 rounded-full border border-purple-200">
            {adventureStep} / 4 Done
          </span>
        </div>

        <p className="text-xs text-stone-600 font-medium leading-relaxed mb-3">
          A fierce candy storm knocked down trees and scattered rainbow crystals across the valley! Squishy and friends must work together to restore the colorful meadow.
        </p>

        {/* Task Steps */}
        <div className="space-y-2 mb-3">
          {adventureTasks.map((t, idx) => {
            const isCompleted = adventureStep > idx;
            const isCurrent = adventureStep === idx;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : isCurrent
                    ? 'bg-white border-2 border-purple-400 text-stone-900 shadow-xs'
                    : 'bg-stone-50 border border-stone-200 text-stone-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <div>
                    <div className="font-display">{t.title}</div>
                    <div className="text-[10px] text-stone-500 font-normal">{t.desc}</div>
                  </div>
                </div>
                <span>{isCompleted ? '✓' : isCurrent ? 'Active' : 'Locked'}</span>
              </div>
            );
          })}
        </div>

        {/* Progress or Claim Button */}
        {adventureStep < 4 ? (
          <button
            onClick={handleAdvanceAdventure}
            className="w-full py-2.5 rounded-full btn-squish-purple text-white font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>✨</span>
            <span>Help Restore Part {adventureStep + 1}: {adventureTasks[adventureStep]?.title}</span>
          </button>
        ) : (
          <div className="p-3 bg-white/95 rounded-2xl text-center border border-amber-300">
            <span className="text-xl">🏆</span>
            <div className="font-display font-extrabold text-amber-900 text-xs mt-1">
              Adventure Completed! The Valley is Restored!
            </div>
            <p className="text-[11px] text-stone-500 italic mt-0.5">
              “There are still many places Squishy has never seen...”
            </p>
          </div>
        )}
      </div>

      {/* Biome Selection Cards */}
      <div className="mb-2">
        <h3 className="font-display font-extrabold text-sm text-stone-900 mb-2">
          Exploration Biomes
        </h3>

        <div className="space-y-2.5">
          {EXPLORATION_ZONES.map((zone) => {
            const isUnlocked = gameState.level >= zone.requiredLevel;
            const isSelected = selectedZone.id === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playTap();
                    setSelectedZone(zone);
                  }
                }}
                className={`jelly-card rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  !isUnlocked
                    ? 'opacity-60 bg-stone-100 cursor-not-allowed'
                    : isSelected
                    ? 'ring-2 ring-rose-500 border-rose-300 shadow-md scale-[1.01]'
                    : 'hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs bg-gradient-to-tr ${zone.bgGradient}`}
                  >
                    {zone.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-stone-900">
                      {zone.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium line-clamp-1">
                      {zone.theme}
                    </p>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                      Rewards: ⚡ +{zone.scavengerRewards.xp} XP · 🪙 +{zone.scavengerRewards.coins} Coins
                    </div>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <span className="text-[11px] font-bold text-stone-400 bg-stone-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                      🔒 Lv. {zone.requiredLevel}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Explore
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Biome Walk & Foraging Panel */}
      <div className="mt-4 jelly-pod rounded-3xl p-4 text-center">
        <div className="text-3xl mb-1">{selectedZone.icon}</div>
        <h4 className="font-display font-extrabold text-sm text-stone-900 mb-0.5">
          Walking in {selectedZone.name}
        </h4>
        <p className="text-xs text-stone-500 mb-3">
          Squishy is happily bouncing along sniffing sweet wild scents.
        </p>

        {forageResult && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold animate-bounce">
            🎉 {forageResult}
          </div>
        )}

        <button
          onClick={handleForage}
          className="w-full py-2.5 rounded-full btn-squish-primary text-white font-display font-extrabold text-xs flex items-center justify-center gap-2"
        >
          <span>🐾</span>
          <span>Forage for Hidden Treats & Coins!</span>
        </button>
      </div>

      {/* ADVENTURE CHEST MODAL */}
      {showChestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="jelly-pod max-w-sm w-full rounded-3xl p-6 text-center border-4 border-amber-300 shadow-2xl relative">
            <div className="text-5xl mb-2 animate-bounce">🎁</div>
            <span className="text-xs font-display font-black text-amber-600 uppercase tracking-widest">
              LEGENDARY REWARD
            </span>
            <h3 className="font-display font-extrabold text-lg text-stone-900 mb-2">
              ADVENTURE CHEST UNLOCKED!
            </h3>
            <p className="text-xs text-stone-600 font-medium mb-4">
              Squishy has restored the entire meadow after the storm! You received:
            </p>

            <div className="space-y-2 mb-4 text-left text-xs font-bold bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-stone-800">
              <div className="flex items-center gap-2">
                <span>🌌</span> <span>Mythic Galaxy Stardust Skin</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👑</span> <span>Star Crystal Tiara Hat</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🪙</span> <span>+500 Gold Coins</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💎</span> <span>+50 Prismatic Gems</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 italic font-semibold mb-4 border border-purple-200">
              “There are still many places Squishy has never seen...”
            </div>

            <button
              onClick={() => setShowChestModal(false)}
              className="w-full py-2.5 rounded-full btn-squish-gold text-stone-900 font-display font-extrabold text-xs"
            >
              Claim Adventure Treasures!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
