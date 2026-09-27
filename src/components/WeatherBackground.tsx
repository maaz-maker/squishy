import React from 'react';

export type SimulatedWeather = 'sunny' | 'rainy' | 'snowy' | 'sunshine' | 'rain' | 'petals' | 'rainbow';

interface WeatherBackgroundProps {
  weather: SimulatedWeather;
  isSleeping?: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weather, isSleeping }) => {
  // Pre-configured deterministic snowflakes for winter conditions
  const snowflakes = [
    { id: 1, left: '6%', delay: '0s', duration: '3.6s', size: 14, icon: '❄️' },
    { id: 2, left: '14%', delay: '1.2s', duration: '4.2s', size: 12, icon: '❅' },
    { id: 3, left: '22%', delay: '2.0s', duration: '3.8s', size: 16, icon: '❄️' },
    { id: 4, left: '32%', delay: '0.6s', duration: '4.5s', size: 13, icon: '❅' },
    { id: 5, left: '44%', delay: '2.5s', duration: '3.5s', size: 15, icon: '❄️' },
    { id: 6, left: '54%', delay: '1.5s', duration: '4.0s', size: 11, icon: '❅' },
    { id: 7, left: '62%', delay: '0.3s', duration: '4.8s', size: 14, icon: '❄️' },
    { id: 8, left: '74%', delay: '1.8s', duration: '3.7s', size: 12, icon: '❅' },
    { id: 9, left: '84%', delay: '2.8s', duration: '4.3s', size: 16, icon: '❄️' },
    { id: 10, left: '92%', delay: '0.9s', duration: '3.9s', size: 11, icon: '❅' },
    { id: 11, left: '18%', delay: '3.1s', duration: '4.1s', size: 15, icon: '❄️' },
    { id: 12, left: '68%', delay: '3.4s', duration: '4.4s', size: 13, icon: '❅' },
  ];

  // Pre-configured deterministic raindrops for steady performance
  const raindrops = [
    { id: 1, left: '4%', delay: '0.1s', duration: '0.9s', height: 22 },
    { id: 2, left: '9%', delay: '0.6s', duration: '1.1s', height: 28 },
    { id: 3, left: '15%', delay: '0.3s', duration: '0.85s', height: 20 },
    { id: 4, left: '21%', delay: '0.8s', duration: '1.0s', height: 25 },
    { id: 5, left: '27%', delay: '0.2s', duration: '0.95s', height: 24 },
    { id: 6, left: '33%', delay: '0.7s', duration: '1.15s', height: 30 },
    { id: 7, left: '40%', delay: '0.4s', duration: '0.8s', height: 22 },
    { id: 8, left: '46%', delay: '0.9s', duration: '1.05s', height: 26 },
    { id: 9, left: '52%', delay: '0.15s', duration: '0.9s', height: 24 },
    { id: 10, left: '58%', delay: '0.65s', duration: '1.2s', height: 28 },
    { id: 11, left: '64%', delay: '0.35s', duration: '0.85s', height: 20 },
    { id: 12, left: '71%', delay: '0.85s', duration: '1.0s', height: 26 },
    { id: 13, left: '77%', delay: '0.25s', duration: '0.95s', height: 23 },
    { id: 14, left: '83%', delay: '0.75s', duration: '1.1s', height: 27 },
    { id: 15, left: '89%', delay: '0.45s', duration: '0.8s', height: 21 },
    { id: 16, left: '95%', delay: '0.95s', duration: '1.05s', height: 25 },
    { id: 17, left: '12%', delay: '1.1s', duration: '0.9s', height: 24 },
    { id: 18, left: '36%', delay: '1.3s', duration: '1.05s', height: 26 },
    { id: 19, left: '61%', delay: '1.05s', duration: '0.85s', height: 22 },
    { id: 20, left: '85%', delay: '1.25s', duration: '1.0s', height: 25 },
  ];

  // Pre-configured cherry blossom sakura petals
  const petals = [
    { id: 1, left: '6%', delay: '0s', duration: '4.2s', size: 14, rotation: '15deg', color: '#f472b6' },
    { id: 2, left: '14%', delay: '1.2s', duration: '4.8s', size: 12, rotation: '-20deg', color: '#fb7185' },
    { id: 3, left: '22%', delay: '2.5s', duration: '4.0s', size: 16, rotation: '40deg', color: '#fbcfe8' },
    { id: 4, left: '31%', delay: '0.8s', duration: '5.2s', size: 13, rotation: '-15deg', color: '#f472b6' },
    { id: 5, left: '42%', delay: '3.1s', duration: '4.4s', size: 15, rotation: '25deg', color: '#fda4af' },
    { id: 6, left: '50%', delay: '1.6s', duration: '4.6s', size: 11, rotation: '-35deg', color: '#fbcfe8' },
    { id: 7, left: '59%', delay: '0.4s', duration: '5.0s', size: 14, rotation: '30deg', color: '#f472b6' },
    { id: 8, left: '68%', delay: '2.2s', duration: '4.3s', size: 16, rotation: '-10deg', color: '#fda4af' },
    { id: 9, left: '77%', delay: '3.6s', duration: '4.7s', size: 12, rotation: '45deg', color: '#fb7185' },
    { id: 10, left: '85%', delay: '1.0s', duration: '4.1s', size: 15, rotation: '-25deg', color: '#fbcfe8' },
    { id: 11, left: '93%', delay: '2.8s', duration: '5.1s', size: 13, rotation: '18deg', color: '#f472b6' },
    { id: 12, left: '18%', delay: '3.9s', duration: '4.5s', size: 14, rotation: '-30deg', color: '#fda4af' },
    { id: 13, left: '64%', delay: '4.1s', duration: '4.9s', size: 15, rotation: '22deg', color: '#fbcfe8' },
    { id: 14, left: '82%', delay: '0.5s', duration: '4.3s', size: 12, rotation: '-15deg', color: '#f472b6' },
  ];

  // Pre-configured sun motes / golden sparkles
  const sunMotes = [
    { id: 1, left: '12%', top: '25%', size: 9, delay: '0.2s' },
    { id: 2, left: '28%', top: '55%', size: 12, delay: '1.2s' },
    { id: 3, left: '44%', top: '20%', size: 7, delay: '0.8s' },
    { id: 4, left: '62%', top: '65%', size: 11, delay: '2.1s' },
    { id: 5, left: '78%', top: '35%', size: 14, delay: '0.5s' },
    { id: 6, left: '88%', top: '70%', size: 8, delay: '1.7s' },
    { id: 7, left: '22%', top: '80%', size: 10, delay: '2.5s' },
    { id: 8, left: '72%', top: '15%', size: 13, delay: '1.0s' },
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-3xl transition-opacity duration-1000 ${
        isSleeping ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* ========================================================
          SUNSHINE / SUNNY WEATHER: Radiant Golden Rays & Floating Motes
      ======================================================== */}
      {(weather === 'sunshine' || weather === 'sunny') && (
        <div className="absolute inset-0 animate-fadeIn">
          {/* Warm Golden Atmosphere Gradient */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle at 82% 18%, rgba(254, 240, 138, 0.45) 0%, rgba(253, 224, 71, 0.16) 45%, rgba(255, 241, 242, 0.05) 75%, transparent 100%)',
            }}
          />

          {/* Rotating Sunbeams SVG in upper right */}
          <div className="absolute -top-16 -right-16 w-72 h-72 animate-weather-sun-spin opacity-45 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300">
              <defs>
                <radialGradient id="sunBeamGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g fill="url(#sunBeamGrad)">
                {/* 12 Sunburst Rays */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <polygon
                    key={deg}
                    points="95,0 105,0 102,100 98,100"
                    transform={`rotate(${deg} 100 100)`}
                  />
                ))}
              </g>
              {/* Sun Core Disc */}
              <circle cx="100" cy="100" r="32" fill="#fde047" opacity="0.6" />
            </svg>
          </div>

          {/* Floating Warm Golden Sun Motes / Bokeh Orbs */}
          {sunMotes.map((m) => (
            <div
              key={m.id}
              className="absolute rounded-full bg-amber-300/70 shadow-[0_0_10px_#fde047] animate-weather-sun-mote pointer-events-none"
              style={{
                left: m.left,
                top: m.top,
                width: `${m.size}px`,
                height: `${m.size}px`,
                animationDelay: m.delay,
              }}
            />
          ))}

          {/* Subtle Golden Lens Sparkle */}
          <div className="absolute top-10 right-20 text-amber-400 text-lg animate-sparkle">
            ✨
          </div>
          <div
            className="absolute top-24 right-36 text-amber-300 text-xs animate-sparkle"
            style={{ animationDelay: '1.5s' }}
          >
            ☀️
          </div>
        </div>
      )}

      {/* ========================================================
          RAIN / RAINY WEATHER: Cozy Diagonal Drops & Water Puddle Ripples
      ======================================================== */}
      {(weather === 'rain' || weather === 'rainy') && (
        <div className="absolute inset-0 animate-fadeIn">
          {/* Cool Cozy Rain Atmosphere Tint */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background:
                'linear-gradient(180deg, rgba(30, 58, 138, 0.14) 0%, rgba(14, 165, 233, 0.08) 50%, rgba(15, 23, 42, 0.16) 100%)',
            }}
          />

          {/* Falling Raindrop Streaks */}
          {raindrops.map((r) => (
            <div
              key={r.id}
              className="absolute animate-weather-raindrop pointer-events-none"
              style={{
                left: r.left,
                top: '-25px',
                width: '1.5px',
                height: `${r.height}px`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(125, 211, 252, 0.85) 60%, rgba(56, 189, 248, 1) 100%)',
                boxShadow: '0 0 4px rgba(56, 189, 248, 0.5)',
                animationDelay: r.delay,
                animationDuration: r.duration,
              }}
            />
          ))}

          {/* Soft Water Splash Ripples near bottom pedestal */}
          <div className="absolute bottom-5 left-1/4 w-16 h-5 rounded-full border border-sky-300/60 animate-weather-ripple pointer-events-none" />
          <div
            className="absolute bottom-7 right-1/4 w-20 h-6 rounded-full border border-cyan-300/50 animate-weather-ripple pointer-events-none"
            style={{ animationDelay: '0.9s' }}
          />
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full border border-sky-200/50 animate-weather-ripple pointer-events-none"
            style={{ animationDelay: '1.4s' }}
          />

          {/* Cozy Rainy Cloud Hints */}
          <div className="absolute top-2 left-3 text-sky-400/50 text-xl font-bold">
            🌧️
          </div>
          <div className="absolute top-2 right-4 text-sky-400/40 text-sm font-bold">
            💧
          </div>
        </div>
      )}

      {/* ========================================================
          PETALS WEATHER: Sakura Blossom Petals Twirling in Breeze
      ======================================================== */}
      {weather === 'petals' && (
        <div className="absolute inset-0 animate-fadeIn">
          {/* Soft Blossom Breeze Atmosphere Gradient */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle at 50% 15%, rgba(251, 207, 232, 0.4) 0%, rgba(253, 164, 175, 0.16) 45%, rgba(255, 241, 242, 0.05) 80%, transparent 100%)',
            }}
          />

          {/* Twirling Cherry Blossom Petals */}
          {petals.map((p) => (
            <div
              key={p.id}
              className="absolute animate-weather-petal pointer-events-none"
              style={{
                left: p.left,
                top: '-30px',
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            >
              {/* SVG Sakura Petal with smooth curved teardrop profile */}
              <svg
                width={p.size}
                height={p.size * 1.3}
                viewBox="0 0 30 40"
                style={{
                  transform: `rotate(${p.rotation})`,
                  filter: 'drop-shadow(0 2px 4px rgba(244, 114, 182, 0.35))',
                }}
              >
                <path
                  d="M 15 0 C 24 10 30 24 22 35 C 15 42 15 42 8 35 C 0 24 6 10 15 0 Z"
                  fill={p.color}
                  opacity="0.88"
                />
                {/* Petal crease highlight */}
                <path
                  d="M 15 4 Q 15 22 15 32"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
          ))}

          {/* Blossom Breeze Flower Icons in corners */}
          <div className="absolute top-2 left-4 text-pink-400/60 text-sm animate-sparkle">
            🌸
          </div>
          <div
            className="absolute top-4 right-6 text-rose-300/60 text-xs animate-sparkle"
            style={{ animationDelay: '1.2s' }}
          >
            🌺
          </div>
        </div>
      )}

      {/* ========================================================
          RAINBOW WEATHER: Prismatic Arch & Sparkle Magic
      ======================================================== */}
      {weather === 'rainbow' && (
        <div className="absolute inset-0 animate-fadeIn">
          {/* Shimmering Rainbow Arch SVG across upper room */}
          <div className="absolute top-0 inset-x-0 h-44 pointer-events-none animate-weather-rainbow">
            <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="20%" stopColor="#fb923c" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#facc15" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#4ade80" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.45" />
                </linearGradient>
              </defs>
              {/* Glowing Prismatic Arch */}
              <path
                d="M 30, 180 C 80, 20 320, 20 370, 180"
                fill="none"
                stroke="url(#rainbowGrad)"
                strokeWidth="28"
                strokeLinecap="round"
                style={{ filter: 'blur(3px)' }}
              />
              <path
                d="M 30, 180 C 80, 20 320, 20 370, 180"
                fill="none"
                stroke="url(#rainbowGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Floating Rainbow Sparkle Stars */}
          <div className="absolute top-8 left-1/4 text-yellow-300 text-sm animate-sparkle">
            ✨
          </div>
          <div
            className="absolute top-12 right-1/4 text-pink-300 text-sm animate-sparkle"
            style={{ animationDelay: '1s' }}
          >
            🌟
          </div>
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 text-cyan-300 text-xs animate-sparkle"
            style={{ animationDelay: '2s' }}
          >
            🌈
          </div>
        </div>
      )}

      {/* ========================================================
          SNOWY WEATHER: Falling Winter Snowflakes & Frost Shimmer
      ======================================================== */}
      {weather === 'snowy' && (
        <div className="absolute inset-0 animate-fadeIn pointer-events-none">
          {/* Crisp Winter Chill Atmosphere Gradient */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background:
                'linear-gradient(180deg, rgba(224, 242, 254, 0.35) 0%, rgba(219, 234, 254, 0.15) 50%, rgba(248, 250, 252, 0.25) 100%)',
            }}
          />

          {/* Falling Snowflakes */}
          {snowflakes.map((s) => (
            <div
              key={s.id}
              className="absolute animate-weather-snow pointer-events-none select-none"
              style={{
                left: s.left,
                top: '-25px',
                fontSize: `${s.size}px`,
                animationDelay: s.delay,
                animationDuration: s.duration,
                color: '#ffffff',
                textShadow: '0 0 6px rgba(186, 230, 253, 0.9), 0 0 12px rgba(125, 211, 252, 0.6)',
              }}
            >
              {s.icon}
            </div>
          ))}

          {/* Frost Sparkle Crystals */}
          <div className="absolute top-2 left-4 text-sky-200 text-sm animate-sparkle">
            ❄️
          </div>
          <div
            className="absolute top-4 right-6 text-sky-100 text-xs animate-sparkle"
            style={{ animationDelay: '1.2s' }}
          >
            ✨
          </div>
          <div
            className="absolute bottom-6 left-6 text-sky-200 text-xs animate-sparkle"
            style={{ animationDelay: '2.1s' }}
          >
            ❅
          </div>

          {/* Soft Frosty Drift at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-sky-100/30 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};
