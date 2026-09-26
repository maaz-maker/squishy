import React from 'react';
import { GameState, JournalEntry } from '../types/game';
import { generateDailyStorySummary } from '../data/journalData';
import { getTodayDateString } from '../data/streakData';
import { sounds } from '../utils/audio';

interface JournalCardProps {
  gameState: GameState;
  onOpenJournal: () => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ gameState, onOpenJournal }) => {
  const entries: JournalEntry[] = gameState.journalEntries || [];
  const today = getTodayDateString();
  const todayEntries = entries.filter((e) => e.dateStr === today);
  const latestEntry = entries[0];

  const todaySummary = generateDailyStorySummary(today, todayEntries);

  return (
    <div className="jelly-card rounded-3xl p-4 mb-4 border-2 border-rose-200/90 shadow-lg relative overflow-hidden transition-all duration-300">
      {/* Decorative Atmosphere Shimmer */}
      <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-bl from-rose-300/20 via-amber-300/10 to-transparent blur-2xl pointer-events-none" />

      {/* Card Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-pink-500 text-white font-display font-black text-xs shadow-sm ring-2 ring-rose-300/40">
            <span className="text-sm">📖</span>
            <span>MEMORY JOURNAL</span>
          </div>

          <span className="text-[11px] font-bold text-stone-500">
            {entries.length} Memories
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenJournal();
          }}
          className="text-[11px] font-display font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-full transition-transform active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
        >
          <span>Open Book</span>
          <span>➔</span>
        </button>
      </div>

      {/* Story summary & Latest Memory teaser */}
      <div className="relative z-10 space-y-2">
        <div>
          <h3 className="font-display font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
            <span>✨</span> Today’s Scrapbook Story
          </h3>
          <p className="text-xs text-stone-700 font-medium italic mt-1 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/60 leading-relaxed line-clamp-2">
            “{todaySummary}”
          </p>
        </div>

        {/* Latest Activity Stamp */}
        {latestEntry && (
          <div className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-xl border border-stone-200 text-stone-600">
            <span className="flex items-center gap-1.5 font-bold truncate">
              <span>{latestEntry.icon}</span>
              <span className="truncate">{latestEntry.title}</span>
            </span>
            <span className="text-stone-400 text-[10px] shrink-0 font-semibold ml-2">
              {latestEntry.timeStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
