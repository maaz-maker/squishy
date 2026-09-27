import React, { useState, useMemo } from 'react';
import { GameState, JournalEntry, JournalCategory } from '../types/game';
import { generateDailyStorySummary, addJournalEntry } from '../data/journalData';
import { getTodayDateString, getYesterdayDateString } from '../data/streakData';
import { AchievementsSection } from './AchievementsSection';
import { sounds } from '../utils/audio';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onUpdateState,
}) => {
  const [modalTab, setModalTab] = useState<'memories' | 'achievements'>('memories');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'milestones' | 'explore' | 'streaks'>('all');
  const [customNote, setCustomNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const entries: JournalEntry[] = gameState.journalEntries || [];
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Group entries by date
  const groupedDates = useMemo(() => {
    const datesMap = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const list = datesMap.get(entry.dateStr) || [];
      list.push(entry);
      datesMap.set(entry.dateStr, list);
    });

    // Ensure today exists in the map
    if (!datesMap.has(today)) {
      datesMap.set(today, []);
    }

    return Array.from(datesMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries, today]);

  const [activeDate, setActiveDate] = useState<string>(today);

  if (!isOpen) return null;

  const activeDateEntries = (entries.filter((e) => e.dateStr === activeDate) || []).filter((e) => {
    if (selectedFilter === 'milestones') return e.category === 'levelup' || e.highlight;
    if (selectedFilter === 'explore') return e.category === 'explore' || e.category === 'adventure';
    if (selectedFilter === 'streaks') return e.category === 'streak' || e.category === 'mission';
    return true;
  });

  const dailySummary = generateDailyStorySummary(
    activeDate,
    entries.filter((e) => e.dateStr === activeDate)
  );

  const handleAddCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;

    sounds.playSquish();
    const updated = addJournalEntry(
      entries,
      'special',
      'Squishy’s Diary Note',
      customNote.trim(),
      '📝',
      true
    );

    onUpdateState({ journalEntries: updated });
    setCustomNote('');
    setShowAddNote(false);
  };

  const getDayDisplayName = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md max-h-[88vh] bg-gradient-to-b from-amber-50/95 via-rose-50/95 to-amber-100/90 rounded-3xl shadow-2xl border-2 border-amber-300 flex flex-col overflow-hidden relative">
        {/* Storybook Spine / Ribbon Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400" />

        {/* Modal Header */}
        <div className="p-4 border-b border-amber-200/80 bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shadow-xs">
              <span>{modalTab === 'memories' ? '📖' : '🏆'}</span>
            </div>
            <div>
              <h3 className="font-display font-black text-stone-900 text-sm flex items-center gap-1.5">
                {modalTab === 'memories' ? 'Squishy’s Memory Journal' : 'Lifetime Milestones & Badges'}
              </h3>
              <p className="text-[11px] text-stone-500 font-semibold">
                {modalTab === 'memories'
                  ? 'Auto-logged daily milestones & adventures'
                  : 'Earn unique profile badges by hitting milestones'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
            aria-label="Close Journal"
          >
            ✕
          </button>
        </div>

        {/* Modal Primary Tab Navigation: Memories vs Achievements */}
        <div className="flex items-center justify-center gap-1 px-4 py-2 bg-amber-100/60 border-b border-amber-200">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setModalTab('memories');
            }}
            className={`flex-1 py-1 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalTab === 'memories'
                ? 'bg-white text-stone-900 shadow-2xs border border-amber-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>📖</span> Memories ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setModalTab('achievements');
            }}
            className={`flex-1 py-1 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalTab === 'achievements'
                ? 'bg-white text-amber-900 shadow-2xs border border-amber-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🏆</span> Milestones & Badges
          </button>
        </div>

        {modalTab === 'achievements' ? (
          <div className="p-4 overflow-y-auto flex-1 animate-fadeIn">
            <AchievementsSection
              gameState={gameState}
              onUpdateState={onUpdateState}
              compact={true}
            />
          </div>
        ) : (
          <>
            {/* Date Selector Navigation Bar */}
            <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {groupedDates.map(([dStr, dEntries]) => (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setActiveDate(dStr);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-display font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeDate === dStr
                      ? 'bg-amber-400 text-stone-900 shadow-xs scale-102 border border-amber-500'
                      : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
                  }`}
                >
                  <span>📅</span>
                  <span>{getDayDisplayName(dStr)}</span>
                  <span className="text-[10px] opacity-75">({dEntries.length})</span>
                </button>
              ))}
            </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Daily Story Summary Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-rose-100/70 to-amber-50/90 border border-amber-300/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-display font-black text-amber-900 mb-1.5">
              <span>✨</span>
              <span>{getDayDisplayName(activeDate)}’s Story Summary</span>
            </div>
            <p className="text-xs text-stone-700 font-medium leading-relaxed italic">
              “{dailySummary}”
            </p>
          </div>

          {/* Filter Chips & Add Note Bar */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'milestones', label: '⭐ Milestones' },
                { id: 'explore', label: '🧭 Expeditions' },
                { id: 'streaks', label: '🔥 Streaks' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id as any)}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                    selectedFilter === f.id
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-[10px] font-display font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full transition-all active:scale-95"
            >
              + Note
            </button>
          </div>

          {/* Add Custom Note Drawer */}
          {showAddNote && (
            <form onSubmit={handleAddCustomNote} className="p-3 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2.5 animate-fadeIn">
              <label className="text-xs font-display font-bold text-stone-800 block">
                Write a memory for Squishy:
              </label>

              {/* Inspiration Prompts Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                  💡 Inspiration Prompts (tap to fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '✨ Squishy giggled so sweetly today when...',
                    '🍓 Squishy’s favorite treat was definitely...',
                    '🧭 We had a wonderful expedition together in...',
                    '💤 Squishy took the coziest nap after...',
                    '💖 The thing I adore most about Squishy is...',
                  ].map((promptText, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setCustomNote(promptText);
                      }}
                      className="text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full transition-all active:scale-95 cursor-pointer text-left"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Squishy made the sweetest squeak today while wearing the beret!"
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-2.5 py-1 text-xs font-bold text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-display font-bold bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-xs cursor-pointer active:scale-95"
                >
                  Save to Journal
                </button>
              </div>
            </form>
          )}

          {/* Logged Events Timeline */}
          {activeDateEntries.length === 0 ? (
            <div className="py-8 text-center bg-white/60 rounded-2xl border border-stone-200/60 p-4">
              <span className="text-3xl block mb-1">🕊️</span>
              <p className="text-xs font-bold text-stone-600">No events found under this filter</p>
              <p className="text-[11px] text-stone-400">
                Play, level up, or explore to record memories automatically!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDateEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                    entry.highlight
                      ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-white border-amber-300 shadow-xs ring-1 ring-amber-200'
                      : 'bg-white/90 border-stone-200 shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                      entry.highlight
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <span>{entry.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-display font-extrabold text-xs text-stone-900 truncate flex items-center gap-1.5">
                        <span>{entry.title}</span>
                        {entry.highlight && (
                          <span className="text-[9px] bg-amber-400 text-stone-900 px-1.5 py-0.2 rounded-full font-black">
                            STAR
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-bold text-stone-400 shrink-0">
                        {entry.timeStr}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
      )}

      {/* Modal Footer */}
        <div className="p-3 bg-white/80 border-t border-amber-200 flex items-center justify-between text-xs text-stone-500 font-semibold">
          <span>Total Memories: {entries.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full font-display font-bold text-xs bg-stone-900 text-white hover:bg-stone-800 transition-all"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
