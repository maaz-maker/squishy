import { DailyStreakReward } from '../types/game';

export const DAILY_STREAK_REWARDS: DailyStreakReward[] = [
  {
    day: 1,
    coins: 100,
    gems: 5,
    bonusTitle: 'Welcome Treat',
    icon: '🍬',
  },
  {
    day: 2,
    coins: 180,
    gems: 10,
    bonusTitle: 'Berry Boost',
    icon: '🍓',
  },
  {
    day: 3,
    coins: 260,
    gems: 15,
    bonusTitle: 'Golden Dumpling',
    icon: '🥟',
  },
  {
    day: 4,
    coins: 360,
    gems: 20,
    bonusTitle: 'Mystery Jar',
    icon: '🫐',
  },
  {
    day: 5,
    coins: 500,
    gems: 30,
    bonusTitle: 'Starlight Cache',
    icon: '⭐',
  },
  {
    day: 6,
    coins: 750,
    gems: 45,
    bonusTitle: 'Crown Jewels',
    icon: '👑',
  },
  {
    day: 7,
    coins: 1200,
    gems: 80,
    bonusTitle: 'Rainbow Mythic Jackpot!',
    icon: '🌈',
    isSpecial: true,
  },
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface StreakStatus {
  currentDayInCycle: number; // 1 to 7
  totalStreak: number;       // total consecutive days
  canClaimToday: boolean;
  isClaimedToday: boolean;
  missedYesterday: boolean;
  todayReward: DailyStreakReward;
  nextReward: DailyStreakReward;
}

export function calculateStreakStatus(
  dailyStreak: number = 0,
  lastClaimDate: string | null = null
): StreakStatus {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const isClaimedToday = lastClaimDate === today;
  let activeStreak = dailyStreak || 0;
  let missedYesterday = false;

  if (isClaimedToday) {
    // Already claimed today
    activeStreak = Math.max(1, dailyStreak || 1);
  } else {
    // Not claimed today yet
    if (!lastClaimDate) {
      // First time player
      activeStreak = 1;
    } else if (lastClaimDate === yesterday) {
      // Maintained streak!
      activeStreak = (dailyStreak || 0) + 1;
    } else {
      // Missed at least 1 day, streak resets to 1
      activeStreak = 1;
      missedYesterday = true;
    }
  }

  // 1-indexed day in the 7-day cycle (1 to 7)
  const currentDayInCycle = ((Math.max(1, activeStreak) - 1) % 7) + 1;
  const todayReward = DAILY_STREAK_REWARDS[currentDayInCycle - 1] || DAILY_STREAK_REWARDS[0];

  const nextDayInCycle = (currentDayInCycle % 7) + 1;
  const nextReward = DAILY_STREAK_REWARDS[nextDayInCycle - 1] || DAILY_STREAK_REWARDS[0];

  return {
    currentDayInCycle,
    totalStreak: activeStreak,
    canClaimToday: !isClaimedToday,
    isClaimedToday,
    missedYesterday,
    todayReward,
    nextReward,
  };
}
