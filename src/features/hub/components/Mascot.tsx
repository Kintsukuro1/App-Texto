import type { MascotMood } from '../hooks/useMascotState';

interface MascotProps {
  mood?: MascotMood;
  onClick?: () => void;
  size?: number;
}

export const Mascot = ({ mood = 'idle', onClick, size = 64 }: MascotProps) => {
  const isHappy = mood === 'happy';

  return (
    <div
      onClick={onClick}
      className="relative inline-flex items-center justify-center cursor-pointer group select-none transition-transform duration-300 hover:scale-110 active:scale-95"
      title="Haz clic para saludar a tu asistente minimalista"
      style={{ width: size, height: size }}
    >
      {/* Subtle background aura glow */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-all duration-500 opacity-60 group-hover:opacity-100 ${
          isHappy
            ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 scale-125 animate-pulse'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 scale-110'
        }`}
      />

      {/* Main SVG Geometry */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 transition-all duration-300 ${
          isHappy ? 'animate-bounce' : 'animate-pulse'
        }`}
      >
        <defs>
          <linearGradient id="mascotGradIdle" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="mascotGradHappy" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.5" stopColor="#EC4899" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>

          <radialGradient id="mascotInnerShine" cx="35%" cy="30%" r="40%">
            <stop stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Minimalist Sphere Body */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill={isHappy ? 'url(#mascotGradHappy)' : 'url(#mascotGradIdle)'}
          className="transition-colors duration-500"
        />

        {/* Inner Highlight Layer */}
        <circle cx="50" cy="50" r="42" fill="url(#mascotInnerShine)" />

        {/* Face Elements */}
        {isHappy ? (
          /* Happy Eyes (^ ^) and Smile */
          <g className="transition-all duration-300">
            {/* Left Eye Arc */}
            <path
              d="M32 45 C 36 38, 42 38, 44 45"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Eye Arc */}
            <path
              d="M56 45 C 58 38, 64 38, 68 45"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Cute Smile Arc */}
            <path
              d="M42 58 C 45 64, 55 64, 58 58"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Sparkle particles */}
            <circle cx="22" cy="30" r="3" fill="#FDE047" className="animate-ping" />
            <circle cx="78" cy="28" r="2.5" fill="#FDE047" className="animate-ping" />
          </g>
        ) : (
          /* Idle Eyes (● ●) and Neutral Smile */
          <g className="transition-all duration-300">
            {/* Left Eye */}
            <circle cx="36" cy="46" r="5" fill="white" />
            {/* Right Eye */}
            <circle cx="64" cy="46" r="5" fill="white" />
            {/* Subtle Eye Catchlights */}
            <circle cx="38" cy="44" r="1.5" fill="#1E1B4B" />
            <circle cx="66" cy="44" r="1.5" fill="#1E1B4B" />
            {/* Gentle Smile Line */}
            <path
              d="M44 58 Q 50 62 56 58"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
