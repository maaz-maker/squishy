import React, { useState } from 'react';
import { GameState, FriendCharacter } from '../types/game';
import { sounds } from '../utils/audio';

interface FriendsTabProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  gameState,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'friends' | 'skills'>('friends');
  const [activeFriend, setActiveFriend] = useState<FriendCharacter>(gameState.friends[0]);
  const [talkDialogue, setTalkDialogue] = useState<string | null>(null);
  const [giftFeedback, setGiftFeedback] = useState<string | null>(null);

  // Active Mini-Game state
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(10);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);

  // Power meter position for Pebble Push
  const [meterValue, setMeterValue] = useState(40);
  const [meterDir, setMeterDir] = useState(1);

  // Platform jump state
  const [jumpPlatform, setJumpPlatform] = useState(0);

  // Scent tiles state
  const [hiddenTreatTile, setHiddenTreatTile] = useState(Math.floor(Math.random() * 6));

  const handleTalkToFriend = (friend: FriendCharacter) => {
    sounds.playPurr();
    const randomLine =
      friend.dialogue[Math.floor(Math.random() * friend.dialogue.length)];
    setTalkDialogue(randomLine);
    setTimeout(() => setTalkDialogue(null), 4000);
  };

  const handleGiveGift = (friend: FriendCharacter) => {
    sounds.playChime();
    // Increase friendship
    const updatedFriends = gameState.friends.map((f) => {
      if (f.id === friend.id) {
        return {
          ...f,
          friendshipLevel: Math.min(f.maxFriendship, f.friendshipLevel + 1),
        };
      }
      return f;
    });

    // Reward player with companion coins
    const bonusCoins = friend.giftReward.coins;
    const bonusGems = friend.giftReward.gems;
    sounds.playCoin();

    onUpdateState({
      friends: updatedFriends,
      coins: gameState.coins + bonusCoins,
      gems: gameState.gems + bonusGems,
      happiness: Math.min(100, gameState.happiness + 10),
    });

    setGiftFeedback(
      `Shared a sweet treat! ${friend.name} gave you 🪙 +${bonusCoins} and 💎 +${bonusGems}!`
    );
    setTimeout(() => setGiftFeedback(null), 3000);
  };

  // Start a skill game
  const startGame = (gameName: string) => {
    sounds.playTap();
    setActiveGame(gameName);
    setGameScore(0);
    setGameTimeLeft(10);
    setGameFeedback(null);
    setJumpPlatform(0);
    setHiddenTreatTile(Math.floor(Math.random() * 6));
  };

  // Pebble Push mechanic
  const handlePebbleTap = () => {
    sounds.playSquish();
    // Green zone is 40 - 65
    if (meterValue >= 35 && meterValue <= 70) {
      sounds.playLevelUp();
      const newStrength = Math.min(100, gameState.skills.strength + 15);
      const newCoins = gameState.coins + 60;
      const newXp = gameState.xp + 50;
      onUpdateState({
        skills: { ...gameState.skills, strength: newStrength },
        coins: newCoins,
        xp: newXp,
      });
      setGameFeedback('💥 SUPER SQUISH PUSH! Boulder rolled away! (+15 Strength, +60 Coins)');
    } else {
      sounds.playTap();
      setGameFeedback('Too gentle! Tap when the needle is in the green zone!');
    }
  };

  // Jelly Jump mechanic
  const handleJumpTap = () => {
    sounds.playSquish();
    const nextP = jumpPlatform + 1;
    setJumpPlatform(nextP);
    sounds.playCoin();
    if (nextP >= 5) {
      sounds.playLevelUp();
      const newJump = Math.min(100, gameState.skills.jump + 20);
      onUpdateState({
        skills: { ...gameState.skills, jump: newJump },
        coins: gameState.coins + 80,
        xp: gameState.xp + 60,
      });
      setGameFeedback('⭐ Reached the Cloud Summit! (+20 Jump Skill, +80 Coins)');
    }
  };

  // Sniff Tile mechanic
  const handleSniffTile = (tileIndex: number) => {
    sounds.playPurr();
    if (tileIndex === hiddenTreatTile) {
      sounds.playChime();
      const newSmell = Math.min(100, gameState.skills.smell + 20);
      onUpdateState({
        skills: { ...gameState.skills, smell: newSmell },
        coins: gameState.coins + 90,
        xp: gameState.xp + 70,
      });
      setGameFeedback('👃 YUM! Squishy’s nose found a buried Golden Dumpling! (+20 Smell)');
    } else {
      sounds.playTap();
      setGameFeedback('Just sweet clover here... try another patch of grass!');
    }
  };

  return (
    <div className="pb-32 max-w-md mx-auto px-4 pt-1 animate-fadeIn">
      {/* Subtitle */}
      <div className="text-center font-display font-black text-stone-400 text-[11px] tracking-widest uppercase mb-1">
        Friends & Skills
      </div>

      <div className="text-center mb-3">
        <h2 className="font-display font-extrabold text-lg text-stone-900 flex items-center justify-center gap-1.5">
          <span>🐾</span> Meadow Companions <span>✨</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          Make forest friends and train Squishy’s super skills
        </p>
      </div>

      {/* Sub Tabs: Friends vs Skills */}
      <div className="flex bg-stone-200/80 p-1 rounded-full mb-4">
        <button
          onClick={() => {
            sounds.playTap();
            setSubTab('friends');
          }}
          className={`flex-1 py-1.5 rounded-full font-display font-bold text-xs transition-all ${
            subTab === 'friends'
              ? 'bg-white text-stone-900 shadow-xs scale-[1.02]'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🐰 Forest Friends (Lv. 9)
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setSubTab('skills');
          }}
          className={`flex-1 py-1.5 rounded-full font-display font-bold text-xs transition-all ${
            subTab === 'skills'
              ? 'bg-white text-stone-900 shadow-xs scale-[1.02]'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          ⚡ Skill Games (Lv. 8)
        </button>
      </div>

      {/* SUBTAB 1: FOREST FRIENDS */}
      {subTab === 'friends' && (
        <div>
          {/* Active Friend Highlight Card */}
          <div className="jelly-pod rounded-3xl p-4 mb-4 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-4xl shadow-md border-2 border-white bg-gradient-to-tr from-pink-100 to-amber-100 mb-2">
              {activeFriend.avatarIcon}
            </div>

            <h3 className="font-display font-extrabold text-base text-stone-900">
              {activeFriend.name}
            </h3>
            <p className="text-xs text-stone-500 font-semibold mb-2">
              {activeFriend.species}
            </p>

            {/* Friendship Hearts */}
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((h) => (
                <span
                  key={h}
                  className={`text-base ${
                    activeFriend.friendshipLevel >= h
                      ? 'text-rose-500 animate-pulse'
                      : 'text-stone-300'
                  }`}
                >
                  ❤️
                </span>
              ))}
              <span className="text-[11px] font-bold text-stone-600 ml-1">
                Friendship {activeFriend.friendshipLevel}/5
              </span>
            </div>

            {/* Talk Dialogue Bubble */}
            {talkDialogue && (
              <div className="mb-3 p-3 bg-white rounded-2xl border-2 border-pink-200 text-stone-800 text-xs font-bold leading-relaxed shadow-sm animate-bounce">
                {talkDialogue}
              </div>
            )}

            {giftFeedback && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold animate-bounce">
                🎁 {giftFeedback}
              </div>
            )}

            {/* Friend Interaction Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTalkToFriend(activeFriend)}
                className="flex-1 py-2 rounded-full bg-white border border-stone-200 font-display font-bold text-xs text-stone-700 hover:bg-stone-50 transition-transform active:scale-95 shadow-xs"
              >
                💬 Talk & Giggle
              </button>
              <button
                onClick={() => handleGiveGift(activeFriend)}
                className="flex-1 py-2 rounded-full btn-squish-primary font-display font-bold text-xs text-white"
              >
                🎁 Give Sweet Treat
              </button>
            </div>
          </div>

          {/* Friends List Grid */}
          <div className="space-y-2">
            <span className="font-display font-black text-stone-400 text-[11px] tracking-wider uppercase block mb-1">
              Select Meadow Companion:
            </span>
            {gameState.friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveFriend(friend);
                }}
                className={`jelly-card rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                  activeFriend.id === friend.id
                    ? 'ring-2 ring-rose-500 border-rose-300 shadow-md scale-[1.01]'
                    : 'hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-50 to-pink-50 border border-stone-200 flex items-center justify-center text-2xl shadow-xs">
                    {friend.avatarIcon}
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-stone-900">
                      {friend.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {friend.species} · Favorite: {friend.favoriteFoodId.replace('food_', '').replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <span className="text-rose-500 text-xs">❤️</span>
                  <span className="font-display font-bold text-xs text-stone-800">
                    {friend.friendshipLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SKILL TRAINING GAMES */}
      {subTab === 'skills' && (
        <div>
          {/* Skill Ratings Bar */}
          <div className="jelly-card rounded-2xl p-3 mb-4 space-y-2">
            <h3 className="font-display font-extrabold text-xs text-stone-900 uppercase tracking-wider mb-2">
              Squishy’s 5 Hero Skills
            </h3>
            {[
              { name: 'Strength', val: gameState.skills.strength, icon: '💪', color: 'from-amber-400 to-orange-500' },
              { name: 'Speed', val: gameState.skills.speed, icon: '⚡', color: 'from-yellow-400 to-amber-500' },
              { name: 'Jump', val: gameState.skills.jump, icon: '🦘', color: 'from-pink-400 to-rose-500' },
              { name: 'Smell & Scent', val: gameState.skills.smell, icon: '👃', color: 'from-purple-400 to-indigo-500' },
              { name: 'Swimming', val: gameState.skills.swimming, icon: '🏊', color: 'from-cyan-400 to-sky-500' },
            ].map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs font-bold mb-0.5">
                  <span className="text-stone-700 flex items-center gap-1">
                    <span>{s.icon}</span> <span>{s.name}</span>
                  </span>
                  <span className="text-rose-600 font-extrabold">{s.val} / 100</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className={`h-full bg-gradient-to-r ${s.color} transition-all`}
                    style={{ width: `${s.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Minigame Cards */}
          <div className="space-y-3">
            {/* Game 1: Pebble Push */}
            <div className="jelly-pod rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-stone-900">
                      Pebble Push Power
                    </h4>
                    <p className="text-[11px] text-stone-500">Train Strength to clear giant boulders</p>
                  </div>
                </div>
                <button
                  onClick={() => startGame('pebble')}
                  className="px-3 py-1 rounded-full btn-squish-gold text-stone-900 font-display font-extrabold text-xs"
                >
                  Play
                </button>
              </div>

              {activeGame === 'pebble' && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-amber-200 text-center animate-fadeIn">
                  <p className="text-xs text-stone-600 font-bold mb-2">
                    Tap &apos;PUSH!&apos; when the power needle is in the green zone!
                  </p>

                  {/* Power meter bar */}
                  <div className="w-full h-5 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-300 relative my-2">
                    {/* Green sweet spot in middle */}
                    <div className="absolute left-[35%] w-[35%] h-full bg-emerald-400 opacity-60" />
                    {/* Moving needle */}
                    <div
                      className="absolute top-0 bottom-0 w-2 bg-rose-600 rounded-full shadow-md transition-all duration-75"
                      style={{ left: `${meterValue}%` }}
                    />
                  </div>

                  {gameFeedback && (
                    <div className="text-xs font-extrabold text-rose-600 mb-2">{gameFeedback}</div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // oscillate meter value for fun
                        setMeterValue((prev) => {
                          const next = prev + (meterDir * 20);
                          if (next >= 90) setMeterDir(-1);
                          if (next <= 10) setMeterDir(1);
                          return Math.max(10, Math.min(90, next));
                        });
                      }}
                      className="flex-1 py-1.5 rounded-full bg-stone-100 text-stone-700 font-bold text-xs"
                    >
                      Cycle Power
                    </button>
                    <button
                      onClick={handlePebbleTap}
                      className="flex-1 py-1.5 rounded-full btn-squish-primary text-white font-extrabold text-xs"
                    >
                      💥 PUSH!
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Game 2: Jelly Jump Summit */}
            <div className="jelly-pod rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🦘</span>
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-stone-900">
                      Jelly Jump Summit
                    </h4>
                    <p className="text-[11px] text-stone-500">Bounce up cloud platforms to collect stars</p>
                  </div>
                </div>
                <button
                  onClick={() => startGame('jump')}
                  className="px-3 py-1 rounded-full btn-squish-primary text-white font-display font-extrabold text-xs"
                >
                  Play
                </button>
              </div>

              {activeGame === 'jump' && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-pink-200 text-center animate-fadeIn">
                  <p className="text-xs text-stone-600 font-bold mb-2">
                    Tap to leap from cloud to cloud! Platform: {jumpPlatform} / 5
                  </p>

                  <div className="flex justify-around items-end h-20 bg-sky-50 rounded-2xl p-2 my-2 border border-sky-100 relative">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={`w-10 rounded-full flex flex-col items-center justify-center transition-all ${
                          jumpPlatform === idx
                            ? 'h-14 bg-rose-400 text-white font-bold text-xs shadow-md scale-110'
                            : 'h-8 bg-sky-200 text-sky-700 text-[10px]'
                        }`}
                      >
                        {jumpPlatform === idx ? '🥟' : '☁️'}
                      </div>
                    ))}
                  </div>

                  {gameFeedback && (
                    <div className="text-xs font-extrabold text-emerald-600 mb-2">{gameFeedback}</div>
                  )}

                  <button
                    onClick={handleJumpTap}
                    className="w-full py-2 rounded-full btn-squish-cyan text-white font-extrabold text-xs"
                  >
                    ⏫ BOUNCE UP!
                  </button>
                </div>
              )}
            </div>

            {/* Game 3: Sniff & Scent Tracker */}
            <div className="jelly-pod rounded-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👃</span>
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-stone-900">
                      Sniff & Scent Forager
                    </h4>
                    <p className="text-[11px] text-stone-500">Sniff out buried golden treats with Squishy</p>
                  </div>
                </div>
                <button
                  onClick={() => startGame('sniff')}
                  className="px-3 py-1 rounded-full btn-squish-purple text-white font-display font-extrabold text-xs"
                >
                  Play
                </button>
              </div>

              {activeGame === 'sniff' && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-purple-200 text-center animate-fadeIn">
                  <p className="text-xs text-stone-600 font-bold mb-2">
                    Tap a grassy patch to sniff for the hidden dumpling!
                  </p>

                  <div className="grid grid-cols-3 gap-2 my-2">
                    {[0, 1, 2, 3, 4, 5].map((tileIdx) => (
                      <button
                        key={tileIdx}
                        onClick={() => handleSniffTile(tileIdx)}
                        className="h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 font-display font-bold text-sm text-emerald-800 flex items-center justify-center transition-transform active:scale-95"
                      >
                        🌿 Patch {tileIdx + 1}
                      </button>
                    ))}
                  </div>

                  {gameFeedback && (
                    <div className="text-xs font-extrabold text-purple-700 mb-1">{gameFeedback}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
