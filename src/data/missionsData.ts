import { DailyMission, MissionCategory } from '../types/game';
import { getTodayDateString } from './streakData';

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'mission_pet_squishy',
    title: 'Pet Squishy 3 times',
    description: 'Give Squishy gentle pats or belly tickles to make them purr with delight.',
    icon: '👆',
    category: 'pet',
    target: 3,
    current: 0,
    rewardCoins: 150,
    rewardGems: 5,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_feed_treats',
    title: 'Feed 2 yummy treats',
    description: 'Provide yummy dumpling snacks or fruit slices from the Treat Lab.',
    icon: '🍓',
    category: 'feed',
    target: 2,
    current: 0,
    rewardCoins: 180,
    rewardGems: 5,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_find_item_explore',
    title: 'Find 1 item in Explore',
    description: 'Venture into the meadow or sunlit forest to forage shiny collectibles.',
    icon: '🧭',
    category: 'explore',
    target: 1,
    current: 0,
    rewardCoins: 220,
    rewardGems: 8,
    completed: false,
    claimed: false,
  },
  {
    id: 'mission_take_nap',
    title: 'Take a cozy Nap',
    description: 'Tuck Squishy in for sweet marshmallow dreams during Nap Time.',
    icon: '🌙',
    category: 'sleep',
    target: 1,
    current: 0,
    rewardCoins: 120,
    completed: false,
    claimed: false,
  },
];

export function getInitialOrRefreshedMissions(
  existingMissions?: DailyMission[],
  lastDate?: string | null
): { missions: DailyMission[]; date: string; bonusClaimed: boolean } {
  const today = getTodayDateString();

  // If today's missions already exist, maintain them
  if (existingMissions && existingMissions.length > 0 && lastDate === today) {
    return {
      missions: existingMissions,
      date: today,
      bonusClaimed: false,
    };
  }

  // Otherwise generate a fresh set for today
  return {
    missions: DEFAULT_DAILY_MISSIONS.map((m) => ({
      ...m,
      current: 0,
      completed: false,
      claimed: false,
    })),
    date: today,
    bonusClaimed: false,
  };
}

export function updateMissionCategoryProgress(
  missions: DailyMission[],
  category: MissionCategory,
  amount: number = 1
): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
  const newlyCompleted: DailyMission[] = [];

  const updatedMissions = missions.map((mission) => {
    if (mission.category !== category || mission.completed) {
      return mission;
    }

    const nextCurrent = Math.min(mission.target, mission.current + amount);
    const isNowCompleted = nextCurrent >= mission.target;

    if (isNowCompleted && !mission.completed) {
      newlyCompleted.push({
        ...mission,
        current: nextCurrent,
        completed: true,
      });
    }

    return {
      ...mission,
      current: nextCurrent,
      completed: isNowCompleted,
    };
  });

  return { updatedMissions, newlyCompleted };
}
