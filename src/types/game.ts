export type SquishyColor = 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'rainbow';

export type SquishySkin = 'pink_glaze' | 'lavender_berry' | 'sky_bubble' | 'mint_gummy' | 'sunny_lemon' | 'rainbow_prism' | 'galaxy_stardust' | 'crystal_frost' | 'glitter_gold';

export type GrowthStage = 
  | 'baby' 
  | 'small' 
  | 'growing' 
  | 'big' 
  | 'young' 
  | 'giant' 
  | 'rainbow';

export type SquishyPersonality = 
  | 'Playful' 
  | 'Sleepy' 
  | 'Energetic' 
  | 'Curious' 
  | 'Friendly';

export type SquishyExpression =
  | 'default'
  | 'happy'
  | 'excited'
  | 'surprised'
  | 'curious'
  | 'sleepy'
  | 'winking'
  | 'starry_eyed'
  | 'loving'
  | 'giggling'
  | 'determined';

export type FoodCategory = 'all' | 'basic' | 'sweet' | 'rare' | 'mystery' | 'giant' | 'rainbow';

export type ItemCategory = 'hats' | 'outfits' | 'accessories' | 'toys' | 'home' | 'skins';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  rarity: ItemRarity;
  xpGain: number;
  happinessGain: number;
  cost: number;
  currency: 'coins' | 'gems';
  icon: string;
  description: string;
  specialEffect?: string;
  color: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  cost: number;
  currency: 'coins' | 'gems';
  icon: string;
  description: string;
  statBonus?: string;
  tag?: string;
  color?: string;
}

export interface DailyStreakReward {
  day: number;
  coins: number;
  gems: number;
  bonusTitle: string;
  icon: string;
  isSpecial?: boolean;
}

export type MissionCategory = 'pet' | 'feed' | 'explore' | 'sleep' | 'personality';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: MissionCategory;
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems?: number;
  completed: boolean;
  claimed: boolean;
}

export type JournalCategory =
  | 'levelup'
  | 'explore'
  | 'streak'
  | 'mission'
  | 'outfit'
  | 'adventure'
  | 'special';

export interface JournalEntry {
  id: string;
  timestamp: number;
  dateStr: string; // "YYYY-MM-DD"
  timeStr: string; // "10:30 AM"
  category: JournalCategory;
  title: string;
  description: string;
  icon: string;
  highlight?: boolean;
}

export interface LevelConfig {
  level: number;
  title: string;
  stageName: GrowthStage;
  stageLabel: string;
  requiredXp: number;
  unlockTitle: string;
  unlockDescription: string;
  sizeMultiplier: number;
  features: string[];
}

export interface FriendCharacter {
  id: string;
  name: string;
  species: string;
  avatarIcon: string;
  color: string;
  favoriteFoodId: string;
  friendshipLevel: number;
  maxFriendship: number;
  dialogue: string[];
  giftReward: {
    coins: number;
    gems: number;
    itemName?: string;
  };
  quest: {
    title: string;
    description: string;
    completed: boolean;
  };
}

export interface HomeDecorItem {
  id: string;
  name: string;
  slot: 'bed' | 'rug' | 'lamp' | 'toy' | 'wallpaper' | 'plant';
  comfortPoints: number;
  icon: string;
}

export interface SkillProgress {
  strength: number; // 0 - 100
  speed: number;
  jump: number;
  smell: number;
  swimming: number;
}

export interface GameState {
  squishyName: string;
  level: number;
  xp: number;
  happiness: number; // 0 - 100
  fullness: number;  // 0 - 100
  friendship: number; // 0 - 100
  personality: SquishyPersonality;
  color: SquishyColor;
  skin: SquishySkin;
  coins: number;
  gems: number;
  
  equippedHat: string | null;
  equippedOutfit: string | null;
  equippedAccessory: string | null;
  equippedToy: string | null;
  
  inventoryItems: string[];
  
  roomDecor: {
    bed: string;
    rug: string;
    lamp: string;
    wallpaper: string;
    plant: string;
  };
  
  skills: SkillProgress;
  friends: FriendCharacter[];
  
  hasCompletedPrologue: boolean;
  hasCompletedLevel10Adventure: boolean;
  adventurePartsCollected: number;
  
  lastFedTime: number;
  comfortLevel: number;

  dailyStreak: number;
  maxStreak: number;
  lastStreakClaimDate: string | null;

  dailyMissions?: DailyMission[];
  dailyMissionsDate?: string | null;
  dailyMissionsBonusClaimed?: boolean;

  journalEntries?: JournalEntry[];
}
