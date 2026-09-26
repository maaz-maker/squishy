import React from 'react';
import { Home, UtensilsCrossed, Store, Compass, HeartHandshake } from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'home' | 'feed' | 'shop' | 'explore' | 'friends';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  feedNotification?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  feedNotification = false,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'feed', label: 'Feed', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop', icon: <Store className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-5 h-5" /> },
    { id: 'friends', label: 'Friends', icon: <HeartHandshake className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-[#fbf9f4] via-[#fbf9f4]/95 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white/90 backdrop-blur-lg border-2 border-white/80 rounded-3xl p-1.5 shadow-lg shadow-pink-900/10 flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-rose-50 text-rose-600 shadow-xs scale-105 font-bold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              {/* Notification pip on Feed tab if hungry */}
              {tab.id === 'feed' && feedNotification && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
              )}

              <div className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[11px] font-display mt-0.5 tracking-tight">
                {tab.label}
              </span>

              {/* Bottom active pill indicator */}
              {isActive && (
                <span className="w-4 h-1 rounded-full bg-rose-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
