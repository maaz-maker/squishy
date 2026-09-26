import React, { useState, useEffect } from 'react';
import { SquishySkin, GrowthStage, SquishyExpression } from '../types/game';
import { sounds } from '../utils/audio';

interface SquishyViewProps {
  skin?: SquishySkin;
  stage?: GrowthStage;
  level?: number;
  equippedHat?: string | null;
  equippedOutfit?: string | null;
  equippedAccessory?: string | null;
  isSleeping?: boolean;
  isEating?: boolean;
  isCelebrating?: boolean;
  expression?: SquishyExpression;
  emotionBubble?: string | null;
  temporaryClass?: string;
  onSquish?: () => void;
  size?: number; // base pixel size
  showPedestal?: boolean;
}

export const SquishyView: React.FC<SquishyViewProps> = ({
  skin = 'pink_glaze',
  stage = 'growing',
  level = 3,
  equippedHat,
  equippedOutfit,
  equippedAccessory,
  isSleeping = false,
  isEating = false,
  isCelebrating = false,
  expression = 'default',
  emotionBubble,
  temporaryClass = '',
  onSquish,
  size = 280,
  showPedestal = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [squishWobble, setSquishWobble] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Random natural eye blink loop
  useEffect(() => {
    if (isSleeping) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isSleeping]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true);
    setSquishWobble(true);
    sounds.playSquish();
    if (onSquish) onSquish();

    // Spawn floating joy heart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now(), x, y };
    setHearts((prev) => [...prev.slice(-4), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    setTimeout(() => setSquishWobble(false), 300);
  };

  // Determine skin gradient colors
  const getSkinGradients = () => {
    switch (skin) {
      case 'lavender_berry':
        return {
          top: '#e9d5ff',
          mid: '#c084fc',
          bot: '#9333ea',
          blush: '#f472b6',
          specular: '#ffffff',
          ambient: 'rgba(168, 85, 247, 0.4)',
        };
      case 'sky_bubble':
        return {
          top: '#bae6fd',
          mid: '#38bdf8',
          bot: '#0284c7',
          blush: '#f472b6',
          specular: '#ffffff',
          ambient: 'rgba(56, 189, 248, 0.4)',
        };
      case 'mint_gummy':
        return {
          top: '#bbf7d0',
          mid: '#4ade80',
          bot: '#16a34a',
          blush: '#fb7185',
          specular: '#ffffff',
          ambient: 'rgba(74, 222, 128, 0.4)',
        };
      case 'sunny_lemon':
        return {
          top: '#fef08a',
          mid: '#facc15',
          bot: '#eab308',
          blush: '#f472b6',
          specular: '#ffffff',
          ambient: 'rgba(250, 204, 21, 0.4)',
        };
      case 'rainbow_prism':
        return {
          top: '#fbcfe8',
          mid: '#c084fc',
          bot: '#38bdf8',
          blush: '#fb7185',
          specular: '#ffffff',
          ambient: 'rgba(236, 72, 153, 0.5)',
        };
      case 'galaxy_stardust':
        return {
          top: '#c084fc',
          mid: '#6366f1',
          bot: '#312e81',
          blush: '#f43f5e',
          specular: '#fbcfe8',
          ambient: 'rgba(99, 102, 241, 0.6)',
        };
      case 'pink_glaze':
      default:
        return {
          top: '#ffd3e2',
          mid: '#ff94ba',
          bot: '#d8b4fe', // pink to soft lavender dumpling
          blush: '#ff4d8d',
          specular: '#ffffff',
          ambient: 'rgba(255, 107, 157, 0.45)',
        };
    }
  };

  const colors = getSkinGradients();

  // Growth size scaling
  const getScaleMultiplier = () => {
    switch (stage) {
      case 'baby': return 0.78;
      case 'small': return 0.88;
      case 'growing': return 1.0;
      case 'big': return 1.12;
      case 'young': return 1.22;
      case 'giant': return 1.34;
      case 'rainbow': return 1.4;
      default: return 1.0;
    }
  };

  const scale = getScaleMultiplier();

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none touch-none cursor-pointer"
      style={{ width: size, height: size }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Optional Soft Cushion Pedestal */}
      {showPedestal && (
        <div
          className="absolute bottom-4 w-4/5 h-14 rounded-full pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #fce7f3 45%, #e9d5ff 100%)',
            boxShadow: '0 12px 28px rgba(168, 85, 247, 0.25), inset 0 2px 4px #ffffff',
            transform: isPressed ? 'scale(1.08, 0.85)' : 'scale(1, 1)',
          }}
        />
      )}

      {/* Dynamic Ambient Ground Shadow */}
      <div
        className="absolute bottom-3 rounded-full pointer-events-none transition-all duration-200"
        style={{
          width: `${size * 0.62 * (isPressed ? 1.2 : 1)}px`,
          height: `${size * 0.16 * (isPressed ? 1.3 : 1)}px`,
          backgroundColor: colors.ambient,
          filter: 'blur(10px)',
          opacity: isPressed ? 0.8 : 0.45,
        }}
      />

      {/* Main Squishy Character Container */}
      <div
        className={`relative transition-transform duration-150 ${
          isCelebrating ? 'animate-bounce' : isSleeping ? 'animate-pulse' : 'animate-jelly-breathe'
        } ${temporaryClass}`}
        style={{
          transform: isPressed
            ? `scale(${scale * 1.22}, ${scale * 0.78}) translateY(18px)`
            : squishWobble
            ? `scale(${scale * 0.94}, ${scale * 1.08}) translateY(-8px)`
            : `scale(${scale})`,
          transformOrigin: 'bottom center',
        }}
      >
        <svg
          viewBox="0 0 240 220"
          className="w-full h-full overflow-visible"
          style={{ width: size * 0.86, height: size * 0.86 }}
        >
          <defs>
            {/* Dumpling Body Gradient */}
            <radialGradient id={`bodyGrad-${skin}`} cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor={colors.top} />
              <stop offset="55%" stopColor={colors.mid} />
              <stop offset="100%" stopColor={colors.bot} />
            </radialGradient>

            {/* Glossy Top Specular Highlight */}
            <linearGradient id="glossGrad" x1="30%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Subsurface Rim Glow */}
            <linearGradient id="rimGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="10%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="90%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
            </linearGradient>

            {/* Cheek Blush Blur */}
            <filter id="blushBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>

            {/* Ambient drop shadow */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={colors.bot} floodOpacity="0.25" />
            </filter>
          </defs>

          {/* SQUISHY DUMPLING BODY */}
          <g filter="url(#softShadow)">
            {/* Main Dumpling Silhouette with top knot pinch */}
            <path
              d="
                M 120, 24
                C 126, 24 135, 36 142, 44
                C 176, 52 208, 86 214, 126
                C 220, 168 184, 202 120, 202
                C 56, 202 20, 168 26, 126
                C 32, 86 64, 52 98, 44
                C 105, 36 114, 24 120, 24 Z
              "
              fill={`url(#bodyGrad-${skin})`}
            />

            {/* Dumpling Top Knot Ruffle Pleats (Image 1 reference) */}
            <path
              d="
                M 112, 28 C 114, 20 126, 20 128, 28
                C 134, 24 142, 32 136, 40
                C 124, 46 116, 46 104, 40
                C 98, 32 106, 24 112, 28 Z
              "
              fill={colors.top}
              opacity="0.9"
            />
            {/* Top Knot Crease Lines */}
            <path d="M 120, 25 Q 120, 42 120, 44" stroke={colors.mid} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 112, 28 Q 116, 38 114, 42" stroke={colors.mid} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M 128, 28 Q 124, 38 126, 42" stroke={colors.mid} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

            {/* Galaxy Stardust Sparkle Particles if skin is galaxy or rainbow */}
            {(skin === 'galaxy_stardust' || skin === 'rainbow_prism') && (
              <g className="animate-sparkle" style={{ transformOrigin: '120px 130px' }}>
                <circle cx="70" cy="110" r="2.5" fill="#ffffff" opacity="0.8" />
                <circle cx="170" cy="140" r="3" fill="#fde047" opacity="0.9" />
                <circle cx="85" cy="165" r="2" fill="#67e8f9" opacity="0.75" />
                <path d="M 155,95 L 157,100 L 162,102 L 157,104 L 155,109 L 153,104 L 148,102 L 153,100 Z" fill="#ffffff" opacity="0.8" />
              </g>
            )}

            {/* Glossy Upper Dome Sheen / Specular Light Reflection */}
            <path
              d="
                M 85, 52
                C 110, 42 135, 42 155, 52
                C 130, 68 105, 68 85, 52 Z
              "
              fill="url(#glossGrad)"
            />
            {/* Secondary tiny gloss droplet */}
            <ellipse cx="62" cy="85" rx="14" ry="22" transform="rotate(-30 62 85)" fill="#ffffff" opacity="0.45" />

            {/* Bottom translucent rim bounce */}
            <path
              d="
                M 45, 150
                C 70, 192 170, 192 195, 150
                C 170, 182 70, 182 45, 150 Z
              "
              fill="#ffffff"
              opacity="0.32"
            />
          </g>

          {/* OUTFIT RENDERING (Collar / Vest / Bib / Raincoat) */}
          {equippedOutfit === 'outfit_froggy_raincoat' && (
            <g>
              <path
                d="M 50, 140 C 70, 196 170, 196 190, 140 C 160, 155 80, 155 50, 140 Z"
                fill="#4ade80"
                stroke="#16a34a"
                strokeWidth="3"
              />
              <circle cx="120" cy="160" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="120" cy="178" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            </g>
          )}

          {equippedOutfit === 'outfit_striped_hoodie' && (
            <g>
              <path
                d="M 52, 142 C 72, 196 168, 196 188, 142 C 158, 154 82, 154 52, 142 Z"
                fill="#fde047"
                stroke="#eab308"
                strokeWidth="2.5"
              />
              <path d="M 64, 160 C 85, 184 155, 184 176, 160" stroke="#38bdf8" strokeWidth="5" fill="none" />
              <path d="M 78, 178 C 96, 194 144, 194 162, 178" stroke="#38bdf8" strokeWidth="5" fill="none" />
            </g>
          )}

          {equippedOutfit === 'outfit_celestial_cape' && (
            <g className="animate-pulse">
              <path
                d="M 35, 130 C 20, 180 60, 205 120, 205 C 180, 205 220, 180 205, 130 C 185, 150 55, 150 35, 130 Z"
                fill="#6366f1"
                opacity="0.75"
              />
              <circle cx="60" cy="175" r="2.5" fill="#fde047" />
              <circle cx="180" cy="175" r="2.5" fill="#fde047" />
              <circle cx="120" cy="190" r="3" fill="#ffffff" />
            </g>
          )}

          {/* FACIAL EXPRESSIONS */}
          {/* Sweet Rosy Blushing Cheeks */}
          <circle cx="68" cy="138" r="18" fill={colors.blush} opacity="0.5" filter="url(#blushBlur)" />
          <circle cx="172" cy="138" r="18" fill={colors.blush} opacity="0.5" filter="url(#blushBlur)" />
          {/* Subtle blush highlight dots */}
          <circle cx="64" cy="135" r="3" fill="#ffffff" opacity="0.6" />
          <circle cx="168" cy="135" r="3" fill="#ffffff" opacity="0.6" />

          {/* EYES */}
          {isSleeping || expression === 'sleepy' ? (
            // Sleeping happy contented curved arcs
            <g stroke="#3a253b" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 75, 122 Q 90, 132 102, 122" />
              <path d="M 138, 122 Q 150, 132 165, 122" />
            </g>
          ) : isBlinking ? (
            // Blinking closed cheerful curves
            <g stroke="#3a253b" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 76, 124 Q 90, 116 102, 124" />
              <path d="M 138, 124 Q 150, 116 164, 124" />
            </g>
          ) : expression === 'winking' ? (
            <g>
              {/* Left Eye Sparkly Open */}
              <ellipse cx="88" cy="120" rx="15" ry="17" fill="#321e33" />
              <circle cx="83" cy="114" r="5" fill="#ffffff" />
              <circle cx="94" cy="126" r="2.5" fill="#ffffff" />
              <path
                d="M 94, 114 L 95.5, 117 L 98.5, 118 L 95.5, 119 L 94, 122 L 92.5, 119 L 89.5, 118 L 92.5, 117 Z"
                fill="#fde047"
              />
              {/* Right Eye Playful Wink */}
              <path d="M 138, 120 Q 152, 132 166, 120" stroke="#321e33" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : expression === 'surprised' ? (
            <g>
              {/* Wide Surprised Open Eyes with Small Alert Pupils */}
              <circle cx="88" cy="118" r="16" fill="#ffffff" stroke="#321e33" strokeWidth="3" />
              <circle cx="88" cy="118" r="7.5" fill="#321e33" />
              <circle cx="85" cy="115" r="2.5" fill="#ffffff" />

              <circle cx="152" cy="118" r="16" fill="#ffffff" stroke="#321e33" strokeWidth="3" />
              <circle cx="152" cy="118" r="7.5" fill="#321e33" />
              <circle cx="149" cy="115" r="2.5" fill="#ffffff" />
            </g>
          ) : expression === 'loving' ? (
            <g>
              {/* Loving Squint Curves with Heart Eyes */}
              <g stroke="#e11d48" strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M 76, 122 Q 88, 112 100, 122" />
                <path d="M 140, 122 Q 152, 112 164, 122" />
              </g>
              {/* Floating Sweet Heart Accents */}
              <text x="81" y="112" fontSize="14" fill="#f43f5e" className="animate-pulse">💖</text>
              <text x="145" y="112" fontSize="14" fill="#f43f5e" className="animate-pulse">💖</text>
            </g>
          ) : expression === 'giggling' ? (
            // Joyful Crescent Laughing Squints
            <g stroke="#3a253b" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 76, 124 Q 88, 112 100, 124" />
              <path d="M 140, 124 Q 152, 112 164, 124" />
            </g>
          ) : expression === 'curious' ? (
            <g>
              {/* Inquisitive Expression */}
              <ellipse cx="88" cy="118" rx="16" ry="18" fill="#321e33" />
              <circle cx="84" cy="112" r="5" fill="#ffffff" />
              <ellipse cx="152" cy="120" rx="13" ry="14" fill="#321e33" />
              <circle cx="149" cy="116" r="4" fill="#ffffff" />
              {/* Curious Raised Left Brow */}
              <path d="M 76, 96 Q 90, 90 102, 96" fill="none" stroke="#713f12" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
            </g>
          ) : expression === 'determined' ? (
            <g>
              {/* Focused Determined Eyes with Golden Core */}
              <ellipse cx="88" cy="120" rx="15" ry="16" fill="#321e33" />
              <polygon points="88,110 93,120 88,126 83,120" fill="#fde047" />
              <circle cx="84" cy="114" r="4" fill="#ffffff" />

              <ellipse cx="152" cy="120" rx="15" ry="16" fill="#321e33" />
              <polygon points="152,110 157,120 152,126 147,120" fill="#fde047" />
              <circle cx="148" cy="114" r="4" fill="#ffffff" />
              {/* Determined Brows */}
              <path d="M 78, 104 L 100, 109" stroke="#4a1525" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 162, 104 L 140, 109" stroke="#4a1525" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : expression === 'starry_eyed' ? (
            <g>
              {/* Sparkling Star Eyes */}
              <ellipse cx="88" cy="120" rx="16" ry="17" fill="#2d132c" />
              <path
                d="M 88, 108 L 91, 116 L 99, 120 L 91, 124 L 88, 132 L 85, 124 L 77, 120 L 85, 116 Z"
                fill="#fde047"
              />
              <circle cx="88" cy="120" r="3.5" fill="#ffffff" />
              <circle cx="82" cy="113" r="3" fill="#ffffff" />
              <circle cx="94" cy="127" r="2" fill="#ffffff" />

              <ellipse cx="152" cy="120" rx="16" ry="17" fill="#2d132c" />
              <path
                d="M 152, 108 L 155, 116 L 163, 120 L 155, 124 L 152, 132 L 149, 124 L 141, 120 L 149, 116 Z"
                fill="#fde047"
              />
              <circle cx="152" cy="120" r="3.5" fill="#ffffff" />
              <circle cx="146" cy="113" r="3" fill="#ffffff" />
              <circle cx="158" cy="127" r="2" fill="#ffffff" />
            </g>
          ) : expression === 'excited' ? (
            <g>
              {/* Giant High-Energy Sparkling Anime Eyes */}
              <ellipse cx="88" cy="118" rx="17" ry="18" fill="#321e33" />
              <circle cx="83" cy="111" r="6" fill="#ffffff" />
              <circle cx="95" cy="124" r="3.5" fill="#ffffff" />
              <circle cx="84" cy="124" r="2.5" fill="#fde047" />
              <path d="M 88, 108 L 90, 112 L 94, 113 L 90, 115 L 88, 119 L 86, 115 L 82, 113 L 86, 112 Z" fill="#ffffff" />

              <ellipse cx="152" cy="118" rx="17" ry="18" fill="#321e33" />
              <circle cx="147" cy="111" r="6" fill="#ffffff" />
              <circle cx="159" cy="124" r="3.5" fill="#ffffff" />
              <circle cx="148" cy="124" r="2.5" fill="#fde047" />
              <path d="M 152, 108 L 154, 112 L 158, 113 L 154, 115 L 152, 119 L 150, 115 L 146, 113 L 150, 112 Z" fill="#ffffff" />
            </g>
          ) : expression === 'happy' ? (
            // Cheerful happy arc eyes
            <g stroke="#3a253b" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 75, 122 Q 88, 110 101, 122" />
              <path d="M 139, 122 Q 152, 110 165, 122" />
            </g>
          ) : (
            // Giant Sparkly Mystery Toy Anime Eyes (Image 1 reference!)
            <g>
              {/* Left Eye */}
              <ellipse cx="88" cy="120" rx="15" ry="17" fill="#321e33" />
              {/* Sparkle star highlights inside left eye */}
              <circle cx="83" cy="114" r="5" fill="#ffffff" />
              <circle cx="94" cy="126" r="2.5" fill="#ffffff" />
              {/* Golden diamond star sparkle in eye */}
              <path
                d="M 94, 114 L 95.5, 117 L 98.5, 118 L 95.5, 119 L 94, 122 L 92.5, 119 L 89.5, 118 L 92.5, 117 Z"
                fill="#fde047"
              />

              {/* Right Eye */}
              <ellipse cx="152" cy="120" rx="15" ry="17" fill="#321e33" />
              {/* Sparkle star highlights inside right eye */}
              <circle cx="147" cy="114" r="5" fill="#ffffff" />
              <circle cx="158" cy="126" r="2.5" fill="#ffffff" />
              <path
                d="M 158, 114 L 159.5, 117 L 162.5, 118 L 159.5, 119 L 158, 122 L 156.5, 119 L 153.5, 118 L 156.5, 117 Z"
                fill="#fde047"
              />
            </g>
          )}

          {/* MOUTH */}
          {isEating ? (
            // Joyful open munching mouth
            <g>
              <ellipse cx="120" cy="138" rx="10" ry="12" fill="#581c2f" />
              <path d="M 113, 142 Q 120, 147 127, 142" fill="#fb7185" />
            </g>
          ) : isCelebrating || expression === 'excited' || expression === 'giggling' ? (
            // Wide open happy smile
            <path
              d="M 108, 132 Q 120, 150 132, 132 Z"
              fill="#701a35"
              stroke="#4a1525"
              strokeWidth="1.5"
            />
          ) : expression === 'surprised' ? (
            // Surprised little round 'O' mouth
            <ellipse cx="120" cy="138" rx="6.5" ry="9" fill="#581c2f" stroke="#3a1520" strokeWidth="1.5" />
          ) : expression === 'curious' ? (
            // Wavy inquisitive mouth
            <path
              d="M 113, 134 Q 118, 141 123, 136 Q 127, 132 130, 136"
              fill="none"
              stroke="#4a2135"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : expression === 'determined' ? (
            // Firm determined straight mouth
            <path
              d="M 112, 136 Q 120, 134 128, 136"
              fill="none"
              stroke="#4a2135"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : expression === 'loving' ? (
            // Sweet affectionate smile
            <path
              d="M 112, 132 Q 120, 144 128, 132"
              fill="none"
              stroke="#e11d48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            // Sweet cute curved smile
            <path
              d="M 112, 132 Q 120, 141 128, 132"
              fill="none"
              stroke="#4a2135"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* ACCESSORY RENDERING (Bowtie, Wand, Boba Cup) */}
          {equippedAccessory === 'acc_star_bowtie' && (
            <g transform="translate(120, 160)">
              {/* Bowtie Left Wing */}
              <polygon points="0,0 -22,-10 -22,10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
              {/* Bowtie Right Wing */}
              <polygon points="0,0 22,-10 22,10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
              {/* Center Star Button */}
              <circle cx="0" cy="0" r="6" fill="#f59e0b" />
              <circle cx="0" cy="0" r="3.5" fill="#fef08a" />
            </g>
          )}

          {equippedAccessory === 'acc_star_wand' && (
            <g transform="translate(195, 110) rotate(15)">
              <rect x="-3" y="0" width="6" height="50" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
              {/* Top Star */}
              <path
                d="M 0,-16 L 4,-5 L 15,-4 L 7,4 L 10,15 L 0,8 L -10,15 L -7,4 L -15,-4 L -4,-5 Z"
                fill="#fde047"
                stroke="#eab308"
                strokeWidth="2"
              />
              <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
            </g>
          )}

          {equippedAccessory === 'acc_boba_cup' && (
            <g transform="translate(190, 130)">
              {/* Miniature Boba Cup */}
              <path d="M 0,0 L 4,28 L 22,28 L 26,0 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.9" />
              <path d="M 2,8 L 5,26 L 21,26 L 24,8 Z" fill="#fdba74" />
              {/* Boba pearls */}
              <circle cx="8" cy="22" r="2.5" fill="#451a03" />
              <circle cx="14" cy="23" r="2.5" fill="#451a03" />
              <circle cx="18" cy="21" r="2.5" fill="#451a03" />
              {/* Straw */}
              <line x1="13" y1="2" x2="19" y2="-12" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* HAT RENDERING (Strawberry Beret, Mint Beast Beanie, Froggy Hood, Star Tiara, Flower Crown) */}
          {equippedHat === 'hat_strawberry_beret' && (
            <g transform="translate(120, 42)">
              {/* Beret Base */}
              <ellipse cx="0" cy="0" rx="46" ry="24" fill="#f43f5e" stroke="#be123c" strokeWidth="3" />
              {/* Little Strawberry Stem */}
              <path d="M -3,-18 C -1,-28 10,-26 8,-16" stroke="#22c55e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Leaf petals */}
              <path d="M 0,-18 C -8,-22 -12,-16 0,-18" fill="#4ade80" />
              <path d="M 0,-18 C 8,-22 12,-16 0,-18" fill="#4ade80" />
              {/* Strawberry seeds */}
              <ellipse cx="-18" cy="-2" rx="2" ry="3" fill="#fef08a" />
              <ellipse cx="0" cy="4" rx="2" ry="3" fill="#fef08a" />
              <ellipse cx="20" cy="-2" rx="2" ry="3" fill="#fef08a" />
              <ellipse cx="-8" cy="-8" rx="2" ry="3" fill="#fef08a" />
              <ellipse cx="10" cy="-8" rx="2" ry="3" fill="#fef08a" />
            </g>
          )}

          {equippedHat === 'hat_bear_beanie' && (
            <g transform="translate(120, 44)">
              {/* Mint Beast Beanie (Image 2 companion hat inspiration!) */}
              <path
                d="M -48,0 C -52,-28 52,-28 48,0 C 35,4 -35,4 -48,0 Z"
                fill="#6ee7b7"
                stroke="#059669"
                strokeWidth="3"
              />
              {/* Fluffy Brim */}
              <path
                d="M -50,0 C -30,6 30,6 50,0 C 40,-6 -40,-6 -50,0 Z"
                fill="#fef08a"
                stroke="#eab308"
                strokeWidth="2.5"
              />
              {/* Left Round Ear */}
              <circle cx="-38" cy="-22" r="14" fill="#a7f3d0" stroke="#059669" strokeWidth="2.5" />
              <circle cx="-38" cy="-22" r="8" fill="#fbcfe8" />
              {/* Right Round Ear */}
              <circle cx="38" cy="-22" r="14" fill="#a7f3d0" stroke="#059669" strokeWidth="2.5" />
              <circle cx="38" cy="-22" r="8" fill="#fbcfe8" />
              {/* Tiny Center Horns */}
              <polygon points="-16,-24 -12,-36 -8,-24" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
              <polygon points="8,-24 12,-36 16,-24" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            </g>
          )}

          {equippedHat === 'hat_froggy_hood' && (
            <g transform="translate(120, 42)">
              <path
                d="M -46,0 C -48,-24 48,-24 46,0 Z"
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="3"
              />
              {/* Frog Left Eye */}
              <circle cx="-25" cy="-20" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />
              <circle cx="-25" cy="-20" r="7" fill="#ffffff" />
              <circle cx="-24" cy="-20" r="3.5" fill="#1e293b" />
              {/* Frog Right Eye */}
              <circle cx="25" cy="-20" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />
              <circle cx="25" cy="-20" r="7" fill="#ffffff" />
              <circle cx="24" cy="-20" r="3.5" fill="#1e293b" />
            </g>
          )}

          {equippedHat === 'hat_star_tiara' && (
            <g transform="translate(120, 36)">
              <path
                d="M -35,5 L -30,-15 L -15,-5 L 0,-25 L 15,-5 L 30,-15 L 35,5 Z"
                fill="#fde047"
                stroke="#ca8a04"
                strokeWidth="2.5"
              />
              <circle cx="0" cy="-25" r="4.5" fill="#67e8f9" />
              <circle cx="-30" cy="-15" r="3.5" fill="#f43f5e" />
              <circle cx="30" cy="-15" r="3.5" fill="#f43f5e" />
            </g>
          )}

          {equippedHat === 'hat_flower_crown' && (
            <g transform="translate(120, 44)">
              <ellipse cx="0" cy="0" rx="44" ry="12" fill="none" stroke="#22c55e" strokeWidth="3" />
              <circle cx="-28" cy="-4" r="7" fill="#f472b6" />
              <circle cx="-28" cy="-4" r="3" fill="#fef08a" />
              <circle cx="0" cy="-8" r="8" fill="#fde047" />
              <circle cx="0" cy="-8" r="3" fill="#ea580c" />
              <circle cx="28" cy="-4" r="7" fill="#c084fc" />
              <circle cx="28" cy="-4" r="3" fill="#fef08a" />
            </g>
          )}
        </svg>

        {/* Floating Sparkle Particles around Squishy (Image 1 reference!) */}
        <div className="absolute top-2 -left-3 text-pink-400 text-lg pointer-events-none animate-sparkle">
          ✨
        </div>
        <div className="absolute top-8 -right-3 text-purple-400 text-base pointer-events-none animate-sparkle" style={{ animationDelay: '1s' }}>
          ⭐
        </div>
        <div className="absolute bottom-12 -left-4 text-amber-300 text-sm pointer-events-none animate-sparkle" style={{ animationDelay: '1.8s' }}>
          ✨
        </div>
      </div>

      {/* Floating Hearts spawned when tapped */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none text-xl animate-float"
          style={{
            left: h.x - 12,
            top: h.y - 30,
            opacity: 0.9,
            transition: 'all 1.2s ease-out',
            transform: 'translateY(-40px) scale(1.3)',
          }}
        >
          💖
        </div>
      ))}

      {/* Dynamic Emotion Reaction Bubble */}
      {emotionBubble && (
        <div className="absolute -top-3 right-4 z-20 bg-white/95 px-2.5 py-1 rounded-full shadow-lg border-2 border-pink-200 text-sm font-bold flex items-center gap-1 animate-bounce pointer-events-none">
          <span>{emotionBubble}</span>
        </div>
      )}

      {/* Sleeping Zzz Bubble */}
      {isSleeping && (
        <div className="absolute top-4 right-8 flex flex-col items-center pointer-events-none animate-float">
          <span className="text-purple-600 font-bold text-lg">Z</span>
          <span className="text-purple-400 font-bold text-sm -mt-1 ml-3">z</span>
          <span className="text-purple-300 font-bold text-xs -mt-1 ml-5">z</span>
        </div>
      )}
    </div>
  );
};
