import { JournalEntry, JournalCategory } from '../types/game';
import { getTodayDateString, getYesterdayDateString } from './streakData';

export function getFormattedTime(): string {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function createJournalEntry(
  category: JournalCategory,
  title: string,
  description: string,
  icon: string,
  highlight: boolean = false
): JournalEntry {
  const now = Date.now();
  return {
    id: `entry_${now}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    dateStr: getTodayDateString(),
    timeStr: getFormattedTime(),
    category,
    title,
    description,
    icon,
    highlight,
  };
}

export function addJournalEntry(
  existingEntries: JournalEntry[] = [],
  category: JournalCategory,
  title: string,
  description: string,
  icon: string,
  highlight: boolean = false
): JournalEntry[] {
  // Avoid duplicate rapid log for the exact same event
  const lastEntry = existingEntries[0];
  if (lastEntry && lastEntry.title === title && Date.now() - lastEntry.timestamp < 5000) {
    return existingEntries;
  }

  const newEntry = createJournalEntry(category, title, description, icon, highlight);
  // Keep newest at the top, max 80 entries stored
  return [newEntry, ...existingEntries].slice(0, 80);
}

/**
 * Generate a delightful contextual story summary for a given day
 */
export function generateDailyStorySummary(dateStr: string, entries: JournalEntry[]): string {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const dayLabel = dateStr === today ? 'Today' : dateStr === yesterday ? 'Yesterday' : dateStr;

  if (entries.length === 0) {
    return `${dayLabel} was a calm, restful day in the marshmallow nursery. Squishy dozed peacefully and dreamed of sweet cloud puddings.`;
  }

  const hasLevelUp = entries.some((e) => e.category === 'levelup');
  const hasExplore = entries.some((e) => e.category === 'explore');
  const hasStreak = entries.some((e) => e.category === 'streak');
  const hasMissions = entries.some((e) => e.category === 'mission');
  const hasOutfit = entries.some((e) => e.category === 'outfit');

  const highlights: string[] = [];

  if (hasLevelUp) {
    highlights.push('celebrated a glorious growth milestone');
  }
  if (hasExplore) {
    highlights.push('ventured through candy meadows foraging glittering relics');
  }
  if (hasStreak) {
    highlights.push('kept our treasured daily friendship streak burning bright');
  }
  if (hasMissions) {
    highlights.push('accomplished daily nursery quests');
  }
  if (hasOutfit) {
    highlights.push('modeled charming boutique accessories');
  }

  if (highlights.length >= 2) {
    return `A bustling, joy-filled day! Squishy ${highlights.slice(0, -1).join(', ')} and ${highlights[highlights.length - 1]}. Hearts and happiness overflowed! 💖`;
  } else if (highlights.length === 1) {
    return `A wonderful day to remember! Squishy ${highlights[0]}, filling the nursery with joyous jelly giggles and warmth. ✨`;
  }

  return `A peaceful and cozy day filled with gentle cuddles, sweet treats, and heartwarming playtime together. 🍓`;
}

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry_seed_1',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: '2026-09-24',
    timeStr: '09:15 AM',
    category: 'special',
    title: 'A Tiny Jelly Miracle!',
    description: 'Squishy was born in the toybox meadow! Proud parents and forest friends gathered to celebrate.',
    icon: '🐣',
    highlight: true,
  },
  {
    id: 'entry_seed_2',
    timestamp: Date.now() - 86400000,
    dateStr: getYesterdayDateString(),
    timeStr: '02:40 PM',
    category: 'outfit',
    title: 'Strawberry Beret Debut',
    description: 'Squishy wore the Strawberry Beret and Star Bowtie for the first time. Everyone agreed they looked adorable!',
    icon: '🍓',
    highlight: false,
  },
  {
    id: 'entry_seed_3',
    timestamp: Date.now() - 3600000 * 4,
    dateStr: getTodayDateString(),
    timeStr: '08:30 AM',
    category: 'streak',
    title: 'Daily Streak Welcomed',
    description: 'Logged into the nursery! Squishy bounced joyfully and shared sweet morning dumpling snacks.',
    icon: '🔥',
    highlight: true,
  },
];
