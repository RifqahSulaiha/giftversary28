/** Elegant animated cat (blinking, swishing tail) sitting beside a glowing heart. */
export function CuteCat() {
  return (
    <div className="relative mx-auto flex h-40 w-64 items-end justify-center" aria-hidden>
      {/* glowing heart */}
      <div className="absolute right-6 bottom-6">
        <div className="absolute inset-[-30px] rounded-full bg-cherry-glow/40 blur-2xl animate-glow-pulse" />
        <svg viewBox="0 0 100 92" className="relative h-20 w-20 animate-heartbeat" style={{ filter: "drop-shadow(0 0 18px var(--cherry-glow))" }}>
          <defs>
            <radialGradient id="hg" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="var(--blush)" />
              <stop offset="45%" stopColor="var(--cherry-glow)" />
              <stop offset="100%" stopColor="var(--burgundy)" />
            </radialGradient>
          </defs>
          <path fill="url(#hg)" d="M50 92 C20 70 0 52 0 28 C0 12 12 0 27 0 C37 0 45 6 50 14 C55 6 63 0 73 0 C88 0 100 12 100 28 C100 52 80 70 50 92Z" />
          <ellipse cx="30" cy="24" rx="10" ry="6" fill="var(--cream)" opacity="0.45" transform="rotate(-25 30 24)" />
        </svg>
      </div>
      {/* cat */}
      <svg viewBox="0 0 140 150" className="absolute left-6 bottom-2 h-36 w-32" style={{ filter: "drop-shadow(0 10px 18px oklch(0 0 0 / 60%))" }}>
        <g style={{ transformOrigin: "100px 128px", animation: "tail-swish 2.6s ease-in-out infinite" }}>
          <path d="M98 130 C130 128 136 96 122 80 C116 74 110 80 116 86 C124 96 118 116 96 118 Z" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.5" />
        </g>
        <path d="M30 140 C24 108 34 82 58 76 C84 72 104 92 104 120 C104 134 98 142 88 142 L44 142 C36 142 32 142 30 140 Z" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.5" />
        <path d="M34 50 L38 18 L56 36 Z" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.5" />
        <path d="M94 50 L92 18 L74 36 Z" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.5" />
        <path d="M40 26 L42 40 L50 36 Z" fill="var(--blush)" opacity="0.6" />
        <path d="M89 26 L87 40 L80 36 Z" fill="var(--blush)" opacity="0.6" />
        <ellipse cx="64" cy="58" rx="34" ry="28" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.5" />
        <g style={{ transformOrigin: "64px 56px", animation: "blink 4.5s infinite" }}>
          <ellipse cx="51" cy="56" rx="5" ry="6.5" fill="var(--rose-gold)" />
          <ellipse cx="77" cy="56" rx="5" ry="6.5" fill="var(--rose-gold)" />
          <circle cx="52.5" cy="54" r="1.6" fill="var(--cream)" />
          <circle cx="78.5" cy="54" r="1.6" fill="var(--cream)" />
        </g>
        <path d="M61 66 L67 66 L64 69 Z" fill="var(--blush)" />
        <path d="M64 69 Q60 74 56 71 M64 69 Q68 74 72 71" stroke="var(--blush)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <ellipse cx="44" cy="68" rx="6" ry="3.5" fill="var(--cherry-glow)" opacity="0.45" />
        <ellipse cx="84" cy="68" rx="6" ry="3.5" fill="var(--cherry-glow)" opacity="0.45" />
        <path d="M30 64 L12 60 M30 68 L12 70 M98 64 L116 60 M98 68 L116 70" stroke="var(--rose-gold)" strokeWidth="1" opacity="0.7" strokeLinecap="round" />
        <ellipse cx="52" cy="140" rx="9" ry="5" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.3" />
        <ellipse cx="76" cy="140" rx="9" ry="5" fill="var(--wine)" stroke="var(--rose-gold)" strokeWidth="1.3" />
        {/* little bow */}
        <path d="M58 84 L50 79 L50 89 Z M70 84 L78 79 L78 89 Z" fill="var(--cherry)" />
        <circle cx="64" cy="84" r="3.5" fill="var(--cherry-glow)" />
      </svg>
    </div>
  );
}
