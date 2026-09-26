import React, { useState } from 'react';
import { GameState, ItemCategory, ShopItem } from '../types/game';
import { BOUTIQUE_ITEMS } from '../data/gameData';
import { SquishyView } from './SquishyView';
import { sounds } from '../utils/audio';

interface ShopTabProps {
  gameState: GameState;
  onBuyOrEquipItem: (item: ShopItem) => void;
  onUnequipSlot: (slot: 'hat' | 'outfit' | 'accessory' | 'toy' | 'skin') => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({
  gameState,
  onBuyOrEquipItem,
  onUnequipSlot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('hats');
  const [selectedItem, setSelectedItem] = useState<ShopItem>(
    BOUTIQUE_ITEMS.find((i) => i.id === 'hat_strawberry_beret') || BOUTIQUE_ITEMS[0]
  );
  const [previewHat, setPreviewHat] = useState<string | null>(gameState.equippedHat);
  const [previewOutfit, setPreviewOutfit] = useState<string | null>(gameState.equippedOutfit);
  const [previewAcc, setPreviewAcc] = useState<string | null>(gameState.equippedAccessory);
  const [previewSkin, setPreviewSkin] = useState<string>(gameState.skin);
  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  const categories: { id: ItemCategory; label: string; icon: string }[] = [
    { id: 'hats', label: 'Hats', icon: '👒' },
    { id: 'outfits', label: 'Outfits', icon: '👗' },
    { id: 'accessories', label: 'Accessories', icon: '✨' },
    { id: 'toys', label: 'Toys', icon: '🧸' },
    { id: 'home', label: 'Home', icon: '🏡' },
    { id: 'skins', label: 'Skins', icon: '🎨' },
  ];

  const filteredItems = BOUTIQUE_ITEMS.filter((i) => i.category === selectedCategory);

  const handleSelectCard = (item: ShopItem) => {
    sounds.playTap();
    setSelectedItem(item);
  };

  const handleTryOn = (item: ShopItem) => {
    sounds.playSquish();
    if (item.category === 'hats') {
      setPreviewHat(item.id);
    } else if (item.category === 'outfits') {
      setPreviewOutfit(item.id);
    } else if (item.category === 'accessories') {
      setPreviewAcc(item.id);
    } else if (item.category === 'skins') {
      setPreviewSkin(item.id.replace('skin_', '') as any);
    }
    setShopFeedback(`Previewing ${item.name}!`);
    setTimeout(() => setShopFeedback(null), 1500);
  };

  const handleResetPreview = () => {
    sounds.playTap();
    setPreviewHat(gameState.equippedHat);
    setPreviewOutfit(gameState.equippedOutfit);
    setPreviewAcc(gameState.equippedAccessory);
    setPreviewSkin(gameState.skin);
    setShopFeedback('Dressing room reset!');
    setTimeout(() => setShopFeedback(null), 1500);
  };

  const isItemOwned = gameState.inventoryItems.includes(selectedItem.id);
  const isEquipped =
    gameState.equippedHat === selectedItem.id ||
    gameState.equippedOutfit === selectedItem.id ||
    gameState.equippedAccessory === selectedItem.id ||
    gameState.skin === selectedItem.id.replace('skin_', '');

  const canAfford =
    selectedItem.currency === 'coins'
      ? gameState.coins >= selectedItem.cost
      : gameState.gems >= selectedItem.cost;

  const handleBuyOrEquip = () => {
    if (!isItemOwned && !canAfford) {
      sounds.playTap();
      setShopFeedback(
        `Not enough ${selectedItem.currency}! Need ${selectedItem.currency === 'coins' ? '🪙' : '💎'} ${selectedItem.cost}`
      );
      setTimeout(() => setShopFeedback(null), 2500);
      return;
    }

    onBuyOrEquipItem(selectedItem);
    // Sync preview to newly equipped
    if (selectedItem.category === 'hats') setPreviewHat(selectedItem.id);
    if (selectedItem.category === 'outfits') setPreviewOutfit(selectedItem.id);
    if (selectedItem.category === 'accessories') setPreviewAcc(selectedItem.id);
    if (selectedItem.category === 'skins') setPreviewSkin(selectedItem.id.replace('skin_', '') as any);

    setShopFeedback(isItemOwned ? `Equipped ${selectedItem.name}!` : `Purchased & Equipped ${selectedItem.name}!`);
    setTimeout(() => setShopFeedback(null), 2500);
  };

  return (
    <div className="pb-32 max-w-md mx-auto px-4 pt-1 animate-fadeIn">
      {/* Subtitle */}
      <div className="text-center font-display font-black text-stone-400 text-[11px] tracking-widest uppercase mb-1">
        Boutique Shop
      </div>

      {/* Header Banner */}
      <div className="text-center mb-3">
        <h2 className="font-display font-extrabold text-lg text-stone-900 flex items-center justify-center gap-1.5">
          <span>🧸</span> Squishy Boutique <span>✨</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          Dress up your jelly pal with squishy couture!
        </p>
      </div>

      {/* Dressing Room Pod matching Image 7.png */}
      <div className="jelly-pod rounded-3xl p-4 mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 font-display font-bold text-[11px] flex items-center gap-1">
            <span>👗</span> DRESSING ROOM
          </div>
          <button
            onClick={handleResetPreview}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-stone-200"
          >
            <span>🔄</span> Reset
          </button>
        </div>

        {/* Squishy Dressing Room Pedestal */}
        <div className="flex flex-col items-center justify-center py-1 relative">
          <SquishyView
            skin={previewSkin as any}
            stage="growing"
            level={gameState.level}
            equippedHat={previewHat}
            equippedOutfit={previewOutfit}
            equippedAccessory={previewAcc}
            size={200}
            showPedestal={true}
          />

          {/* Equipped Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-2">
            {previewHat && (
              <span className="text-[10px] font-bold bg-white/90 border border-pink-200 text-rose-700 px-2 py-0.5 rounded-full shadow-2xs">
                🍓 Hat ✓
              </span>
            )}
            {previewAcc && (
              <span className="text-[10px] font-bold bg-white/90 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full shadow-2xs">
                ⭐ Accessory ✓
              </span>
            )}
            {previewOutfit && (
              <span className="text-[10px] font-bold bg-white/90 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full shadow-2xs">
                🧥 Outfit ✓
              </span>
            )}
          </div>

          {/* Interactive Squish Me Button matching Image 7.png */}
          <button
            onClick={() => sounds.playSquish()}
            className="mt-2 text-xs font-display font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-full transition-transform active:scale-95"
          >
            Squish me!
          </button>

          {shopFeedback && (
            <div className="absolute top-2 bg-stone-900/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
              {shopFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Aisle Department Category Tabs */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-black text-stone-400 text-[11px] tracking-wider uppercase">
            Aisle Department
          </span>
          <span className="text-xs text-rose-500 font-bold">
            {categories.length} Categories
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs scale-105'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Cards Grid matching Image 7.png */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {filteredItems.map((item) => {
          const isSelected = selectedItem.id === item.id;
          const isOwned = gameState.inventoryItems.includes(item.id);
          const isEquippedCurrent =
            gameState.equippedHat === item.id ||
            gameState.equippedOutfit === item.id ||
            gameState.equippedAccessory === item.id ||
            gameState.skin === item.id.replace('skin_', '');

          return (
            <div
              key={item.id}
              onClick={() => handleSelectCard(item)}
              className={`jelly-card rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-rose-500 border-rose-300 shadow-md scale-[1.02]'
                  : 'hover:border-stone-300'
              }`}
            >
              <div>
                {/* Rarity & Status Tag row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[9px] font-display font-extrabold px-1.5 py-0.5 rounded-full ${
                      item.rarity === 'mythic'
                        ? 'bg-purple-100 text-purple-700'
                        : item.rarity === 'legendary'
                        ? 'bg-sky-100 text-sky-700'
                        : item.rarity === 'epic'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.rarity.toUpperCase()}
                  </span>

                  {isEquippedCurrent ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Equipped
                    </span>
                  ) : item.tag ? (
                    <span className="text-[9px] font-semibold text-stone-400">
                      {item.tag}
                    </span>
                  ) : null}
                </div>

                {/* Big Visual Thumbnail Box */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-b from-stone-50 to-stone-100/60 border border-stone-200/80 flex items-center justify-center text-4xl shadow-inner mb-2 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>

                {/* Item Title */}
                <h4 className="font-display font-extrabold text-xs text-stone-900 leading-tight mb-1 truncate">
                  {item.name}
                </h4>
              </div>

              {/* Price & Category footer */}
              <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-stone-100">
                <span className="font-display font-extrabold text-stone-800 flex items-center gap-1">
                  <span>{item.currency === 'coins' ? '🪙' : '💎'}</span>
                  <span>{item.cost}</span>
                </span>
                <span className="text-[10px] text-stone-400 font-semibold capitalize">
                  {item.category.slice(0, -1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Item Detail Sheet matching bottom drawer in Image 7.png */}
      {selectedItem && (
        <div className="jelly-pod rounded-3xl p-4 border-2 border-white shadow-xl">
          {/* Top badges */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-display font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {selectedItem.rarity}
              </span>
              {selectedItem.statBonus && (
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  {selectedItem.statBonus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 font-display font-extrabold text-sm text-stone-900">
              <span>{selectedItem.currency === 'coins' ? '🪙' : '💎'}</span>
              <span>{selectedItem.cost}</span>
            </div>
          </div>

          <h3 className="font-display font-extrabold text-base text-stone-900 mb-1">
            {selectedItem.name}
          </h3>
          <p className="text-xs text-stone-600 font-medium leading-relaxed mb-3">
            {selectedItem.description}
          </p>

          {/* Action Buttons: Try On and Equip/Buy */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTryOn(selectedItem)}
              className="flex-1 py-2.5 rounded-full font-display font-extrabold text-xs text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95"
            >
              <span>✨</span> Try On
            </button>

            <button
              onClick={handleBuyOrEquip}
              className={`flex-1 py-2.5 rounded-full font-display font-extrabold text-xs text-white flex items-center justify-center gap-1 transition-all ${
                isEquipped
                  ? 'btn-squish-cyan'
                  : 'btn-squish-primary'
              }`}
            >
              <span>🛍️</span>
              <span>
                {isEquipped
                  ? 'Equipped'
                  : isItemOwned
                  ? 'Equip'
                  : `Buy for ${selectedItem.currency === 'coins' ? '🪙' : '💎'} ${selectedItem.cost}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
