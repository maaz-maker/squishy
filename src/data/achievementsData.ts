import { AchievementBadge, GameState } from '../types/game';

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'badge_level_5',
    name: 'Rising Star',
    icon: '⭐',
    description: 'Grow Squishy and reach Level 5.',
    category: 'level',
    target: 5,
    rewardCoins: 200,
    rewardGems: 10,
    tier: 'bronze',
  },
  {
    id: 'badge_level_10',
    name: 'Apex Companion',
    icon: '👑',
    description: 'Reach maximum companion status at Level 10.',
    category: 'level',
    target: 10,
    rewardCoins: 1000,
    rewardGems: 50,
    tier: 'celestial',
  },
  {
    id: 'badge_feed_10',
    name: 'Snack Starter',
    icon: '🍓',
    description: 'Feed Squishy 10 delicious treats or dumplings.',
    category: 'feed',
    target: 10,
    rewardCoins: 150,
    rewardGems: 5,
    tier: 'bronze',
  },
  {
    id: 'badge_feed_50',
    name: 'Gourmet Chef',
    icon: '🥟',
    description: 'Feed Squishy 50 gourmet snacks and treats.',
    category: 'feed',
    target: 50,
    rewardCoins: 400,
    rewardGems: 15,
    tier: 'silver',
  },
  {
    id: 'badge_feed_100',
    name: 'Master Feastmaker',
    icon: '🎂',
    description: 'Feed Squishy 100 times to satisfy their sweet jelly belly.',
    category: 'feed',
    target: 100,
    rewardCoins: 800,
    rewardGems: 30,
    tier: 'gold',
  },
  {
    id: 'badge_pet_50',
    name: 'Squishy Whisperer',
    icon: '🐾',
    description: 'Pet, tickle, or poke Squishy 50 times.',
    category: 'pet',
    target: 50,
    rewardCoins: 250,
    rewardGems: 10,
    tier: 'bronze',
  },
  {
    id: 'badge_pet_150',
    name: 'Infinite Cuddles',
    icon: '💖',
    description: 'Pet or tickle Squishy 150 times with endless affection.',
    category: 'pet',
    target: 150,
    rewardCoins: 600,
    rewardGems: 25,
    tier: 'gold',
  },
  {
    id: 'badge_streak_3',
    name: 'Loyal Friend',
    icon: '🌱',
    description: 'Maintain a 3-day consecutive care streak.',
    category: 'streak',
    target: 3,
    rewardCoins: 200,
    rewardGems: 10,
    tier: 'bronze',
  },
  {
    id: 'badge_streak_7',
    name: 'Streak Legend',
    icon: '🔥',
    description: 'Maintain an epic 7-day care streak without missing a day.',
    category: 'streak',
    target: 7,
    rewardCoins: 500,
    rewardGems: 25,
    tier: 'gold',
  },
  {
    id: 'badge_explore_15',
    name: 'Wilds Forager',
    icon: '🧭',
    description: 'Complete 15 foraging expeditions in the Explore biomes.',
    category: 'explore',
    target: 15,
    rewardCoins: 450,
    rewardGems: 20,
    tier: 'silver',
  },
  {
    id: 'badge_journal_5',
    name: 'Memory Keeper',
    icon: '📖',
    description: 'Log 5 cherished memories in Squishy’s Memory Journal.',
    category: 'journal',
    target: 5,
    rewardCoins: 200,
    rewardGems: 10,
    tier: 'bronze',
  },
  {
    id: 'badge_weather_all',
    name: 'Season Wanderer',
    icon: '🌈',
    description: 'Experience all 3 dynamic weather conditions: Sunny, Rainy, and Snowy.',
    category: 'weather',
    target: 3,
    rewardCoins: 350,
    rewardGems: 15,
    tier: 'silver',
  },
  {
    id: 'badge_comfort_50',
    name: 'Cozy Haven',
    icon: '🏡',
    description: 'Decorate Squishy’s nursery to reach 50+ room comfort points.',
    category: 'comfort',
    target: 50,
    rewardCoins: 400,
    rewardGems: 20,
    tier: 'gold',
  },
];

export function getAchievementProgress(
  badge: AchievementBadge,
  gameState: GameState
): { current: number; target: number; completed: boolean; percent: number } {
  let current = 0;
  const stats = gameState.lifetimeStats || {
    totalFeeds: 12,
    totalPets: 20,
    totalPlays: 10,
    totalExplores: 4,
    totalNaps: 5,
    seenWeathers: ['sunny'],
  };

  switch (badge.category) {
    case 'level':
      current = gameState.level;
      break;
    case 'feed':
      current = stats.totalFeeds || 0;
      break;
    case 'pet':
      current = stats.totalPets || 0;
      break;
    case 'streak':
      current = Math.max(gameState.dailyStreak || 0, gameState.maxStreak || 0);
      break;
    case 'explore':
      current = stats.totalExplores || (gameState.inventoryItems?.length || 0);
      break;
    case 'journal':
      current = gameState.journalEntries?.length || 0;
      break;
    case 'weather':
      current = (stats.seenWeathers || []).length;
      break;
    case 'comfort':
      current = gameState.comfortLevel || 0;
      break;
    default:
      current = 0;
  }

  const completed = current >= badge.target;
  const percent = Math.min(100, Math.round((current / badge.target) * 100));

  return { current, target: badge.target, completed, percent };
}

export function checkAndUnlockAchievements(gameState: GameState): {
  updatedUnlocked: string[];
  newlyUnlocked: AchievementBadge[];
} {
  const currentUnlocked = new Set(gameState.unlockedBadgeIds || []);
  const newlyUnlocked: AchievementBadge[] = [];

  ACHIEVEMENT_BADGES.forEach((badge) => {
    if (!currentUnlocked.has(badge.id)) {
      const { completed } = getAchievementProgress(badge, gameState);
      if (completed) {
        currentUnlocked.add(badge.id);
        newlyUnlocked.push(badge);
      }
    }
  });

  return {
    updatedUnlocked: Array.from(currentUnlocked),
    newlyUnlocked,
  };
}
