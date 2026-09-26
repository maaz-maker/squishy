import React, { useState } from 'react';
import { FoodCategory, FoodItem, GameState } from '../types/game';
import { PANTRY_FOODS, LEVELS } from '../data/gameData';
import { SquishyView } from './SquishyView';
import { sounds } from '../utils/audio';

interface FeedTabProps {
  gameState: GameState;
  onFeedSquishy: (food: FoodItem) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({ gameState, onFeedSquishy }) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [justFedFood, setJustFedFood] = useState<FoodItem | null>(null);
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  const currentLevelConfig = LEVELS.find((l) => l.level === gameState.level) || LEVELS[0];
  const nextLevelConfig = LEVELS.find((l) => l.level === gameState.level + 1);

  // Growth Stage calculation (1 to 7)
  const stageNum = Math.min(Math.max(gameState.level, 1), 7);

  // Filter pantry foods
  const filteredFoods = PANTRY_FOODS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const categories: { id: FoodCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '' },
    { id: 'basic', label: 'Basic', icon: '🍙' },
    { id: 'sweet', label: 'Sweet', icon: '🍓' },
    { id: 'rare', label: 'Rare', icon: '⭐' },
    { id: 'rainbow', label: 'Rainbow', icon: '🌈' },
    { id: 'giant', label: 'Giant', icon: '🍈' },
  ];

  const handleFeed = (food: FoodItem) => {
    // Check currency
    if (food.currency === 'coins' && gameState.coins < food.cost) {
      sounds.playTap();
      setFeedNotification(`Not enough coins! Need 🪙 ${food.cost}`);
      setTimeout(() => setFeedNotification(null), 2500);
      return;
    }
    if (food.currency === 'gems' && gameState.gems < food.cost) {
      sounds.playTap();
      setFeedNotification(`Not enough gems! Need 💎 ${food.cost}`);
      setTimeout(() => setFeedNotification(null), 2500);
      return;
    }

    setJustFedFood(food);
    sounds.playMunch();
    if (food.rarity === 'legendary' || food.rarity === 'mythic' || food.category === 'rainbow') {
      setTimeout(() => sounds.playChime(), 200);
    }
    onFeedSquishy(food);

    setFeedNotification(`+${food.xpGain} XP! Squishy loved the ${food.name}!`);
    setTimeout(() => {
      setJustFedFood(null);
      setFeedNotification(null);
    }, 2000);
  };

  const xpProgressPercent = Math.min(
    100,
    Math.round((gameState.xp / currentLevelConfig.requiredXp) * 100)
  );

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-1 animate-fadeIn">
      {/* Tiny section kicker */}
      <div className="text-center font-display font-black text-stone-400 text-[11px] tracking-widest uppercase mb-1">
        Feed and Grow
      </div>

      {/* Growth Lab Card matching Image 5.png */}
      <div className="jelly-pod rounded-3xl p-4 mb-4 relative overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
              ✓
            </span>
            <div>
              <h2 className="font-display font-extrabold text-base text-stone-900 leading-tight">
                Growth Lab
              </h2>
              <p className="text-xs text-stone-500 font-medium -mt-0.5">
                Feed treats to trigger evolution
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-display font-extrabold text-[11px] flex items-center gap-1 shadow-2xs">
            <span>✨</span> STAGE {stageNum} / 7
          </div>
        </div>

        {/* Squishy Hunger Status Pill */}
        <div className="flex justify-center my-1">
          <div
            className={`px-3 py-0.5 rounded-full text-xs font-bold border shadow-2xs flex items-center gap-1 ${
              gameState.fullness < 40
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            {gameState.fullness < 40 ? '😋 Hungry!' : '🥰 Happy & Fed!'}
          </div>
        </div>

        {/* Center Squishy on Pedestal */}
        <div className="relative py-2 flex flex-col items-center justify-center">
          <SquishyView
            skin={gameState.skin}
            stage={currentLevelConfig.stageName}
            level={gameState.level}
            equippedHat={gameState.equippedHat}
            equippedOutfit={gameState.equippedOutfit}
            equippedAccessory={gameState.equippedAccessory}
            isEating={!!justFedFood}
            size={220}
            showPedestal={true}
          />

          {/* Treat Eating Particle Burst */}
          {justFedFood && (
            <div className="absolute top-8 pointer-events-none flex flex-col items-center animate-bounce">
              <span className="text-3xl">{justFedFood.icon}</span>
              <span className="text-xs font-bold text-rose-600 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-1">
                Delicious!
              </span>
            </div>
          )}

          {/* Feedback banner */}
          {feedNotification && (
            <div className="mt-1 px-3 py-1 rounded-full bg-rose-500 text-white font-display font-bold text-xs shadow-md animate-bounce">
              {feedNotification}
            </div>
          )}

          <div className="text-[11px] font-bold text-stone-400 mt-2 flex items-center gap-1">
            <span>⬇️</span> Tap treat or press &apos;Feed&apos; below!
          </div>
        </div>

        {/* Growth Meter & Milestone Progress Bar */}
        <div className="mt-3 pt-3 border-t border-rose-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-display font-bold text-stone-800">
              Level {gameState.level}: {currentLevelConfig.stageLabel} Jelly
            </span>
            <span className="font-display font-extrabold text-rose-600">
              {gameState.xp} / {currentLevelConfig.requiredXp} XP
            </span>
          </div>

          {/* Dual tone XP gradient bar */}
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-sky-400 transition-all duration-500 shadow-xs"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>

          {/* Milestones row */}
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-display font-bold mt-2 px-1">
            {[
              { num: 1, label: 'Baby' },
              { num: 2, label: 'Small' },
              { num: 3, label: 'Growing' },
              { num: 4, label: 'Big' },
              { num: 5, label: 'Young' },
              { num: 6, label: 'Giant' },
              { num: 7, label: 'Rainbow' },
            ].map((m) => {
              const isPassed = gameState.level > m.num;
              const isCurrent = gameState.level === m.num;
              return (
                <div key={m.num} className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] mb-0.5 ${
                      isPassed
                        ? 'bg-rose-500 text-white'
                        : isCurrent
                        ? 'bg-rose-500 text-white ring-2 ring-rose-200 font-extrabold scale-110'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isPassed ? '✓' : m.num}
                  </div>
                  <span className={`${isCurrent ? 'text-rose-600 font-extrabold' : ''}`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Up Next Level Unlock Teaser matching Image 5.png */}
      {nextLevelConfig && (
        <div className="bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 border border-purple-200/80 rounded-2xl p-3 mb-4 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-lg">
              🦊
            </div>
            <div>
              <div className="font-display font-extrabold text-[11px] text-purple-900 flex items-center gap-1">
                <span>UP NEXT AT LV. {nextLevelConfig.level}</span>
                <span>✨</span>
              </div>
              <p className="text-xs text-stone-600 font-semibold leading-tight">
                {nextLevelConfig.unlockDescription}
              </p>
            </div>
          </div>
          <span className="text-stone-400 text-sm">🔒</span>
        </div>
      )}

      {/* Pantry Treats Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-display font-extrabold text-base text-stone-900 leading-tight">
              Pantry Treats
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Choose food to boost vitality and XP
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-400">
            {filteredFoods.length} items
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 pt-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-display font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs scale-105'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Food Item Cards matching Image 5.png */}
        <div className="space-y-3 mt-1">
          {filteredFoods.map((food) => {
            const isAffordable =
              food.currency === 'coins'
                ? gameState.coins >= food.cost
                : gameState.gems >= food.cost;

            return (
              <div
                key={food.id}
                className="jelly-card rounded-2xl p-3.5 flex flex-col gap-2 hover:border-pink-200 transition-colors"
              >
                {/* Top Row: Icon + Details + Price */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Cute Food Icon Box */}
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-50 to-pink-50 border border-stone-200 flex items-center justify-center text-3xl shadow-xs">
                      {food.icon}
                    </div>

                    <div>
                      {/* Rarity Tag */}
                      <span className="text-[10px] font-display font-black text-rose-500 uppercase tracking-wider">
                        {food.rarity === 'common'
                          ? 'COMMON'
                          : food.rarity === 'legendary'
                          ? 'LEGENDARY RAINBOW'
                          : food.rarity === 'epic'
                          ? 'EPIC TITAN'
                          : 'SWEET DELICACY'}
                      </span>
                      <h4 className="font-display font-extrabold text-sm text-stone-900 leading-tight">
                        {food.name}
                      </h4>
                      {/* Stats */}
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-500 mt-0.5">
                        <span className="text-amber-600 flex items-center gap-0.5">
                          ⚡ +{food.xpGain} XP
                        </span>
                        <span className="text-rose-500 flex items-center gap-0.5">
                          💖 +{food.happinessGain} Happy
                        </span>
                        {food.specialEffect && (
                          <span className="text-purple-600 text-[11px]">
                            ✨ {food.specialEffect}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Chip */}
                  <div className="flex items-center gap-1 font-display font-extrabold text-xs text-stone-800 bg-stone-100/90 px-2 py-1 rounded-full border border-stone-200 whitespace-nowrap">
                    <span>{food.currency === 'coins' ? '🪙' : '💎'}</span>
                    <span>{food.cost}</span>
                  </div>
                </div>

                {/* Feed Action Button matching Image 5.png */}
                <button
                  onClick={() => handleFeed(food)}
                  disabled={!isAffordable}
                  className={`w-full py-2.5 rounded-full font-display font-extrabold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                    !isAffordable
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : food.category === 'rainbow'
                      ? 'btn-squish-purple text-white'
                      : food.category === 'giant'
                      ? 'btn-squish-gold text-stone-900'
                      : 'btn-squish-primary text-white'
                  }`}
                >
                  <span>
                    {food.category === 'rainbow'
                      ? '🪄'
                      : food.category === 'giant'
                      ? '📦'
                      : food.category === 'rare'
                      ? '🌟'
                      : '🍴'}
                  </span>
                  <span>Feed Squishy</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tummy Fullness Footer Bar matching Image 5.png */}
      <div className="mt-4 p-3 bg-white/80 rounded-2xl border border-stone-200 flex items-center justify-between text-xs text-stone-600 font-semibold shadow-xs">
        <div className="flex items-center gap-1.5">
          <span>🥣</span>
          <span>Tummy fullness: {gameState.fullness}%</span>
        </div>
        <div className="flex items-center gap-1 text-stone-400 text-[11px]">
          <span>Auto-digest in 4h 12m</span>
          <span>🕒</span>
        </div>
      </div>
    </div>
  );
};
