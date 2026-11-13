import { useMemo } from "react";

/** Lightweight CSS-only floating hearts and twinkling stars. Deterministic so SSR matches. */
export function FloatingHearts({ count = 16, stars = 26 }: { count?: number; stars?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => Math.round((((Math.sin((i + 1) * 9301 + n * 49297) + 1) / 2) % 1) * 1000) / 1000;
        return {
          left: `${Math.round(r(1) * 1000) / 10}%`,
          size: `${Math.round(10 + r(2) * 26)}px`,
          delay: `${Math.round(-r(3) * 180) / 10}s`,
          dur: `${Math.round(140 + r(4) * 140) / 10}s`,
          dx: `${Math.round((r(5) - 0.5) * 120)}px`,
          rot: `${Math.round((r(6) - 0.5) * 80)}deg`,
          o: String(Math.round((0.25 + r(7) * 0.55) * 100) / 100),
          blur: r(8) > 0.7 ? 2 : 0,
        };
      }),
    [count],
  );
  const starList = useMemo(
    () =>
      Array.from({ length: stars }, (_, i) => {
        const r = (n: number) => Math.round((((Math.sin((i + 3) * 7919 + n * 104729) + 1) / 2) % 1) * 1000) / 1000;
        return { left: `${Math.round(r(1) * 1000) / 10}%`, top: `${Math.round(r(2) * 1000) / 10}%`, size: `${Math.round((1.5 + r(3) * 3) * 10) / 10}px`, delay: `${Math.round(-r(4) * 30) / 10}s`, dur: `${Math.round(20 + r(5) * 30) / 10}s` };
      }),
    [stars],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {starList.map((s, i) => (
        <span
          key={`s${i}`}
          className="absolute rounded-full bg-cream animate-twinkle"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur, boxShadow: "0 0 8px var(--blush)" }}
        />
      ))}
      {hearts.map((h, i) => (
        <svg
          key={`h${i}`}
          viewBox="0 0 100 92"
          className="absolute bottom-[-40px] text-cherry-glow"
          style={
            {
              left: h.left,
              width: h.size,
              height: h.size,
              filter: `drop-shadow(0 0 8px var(--cherry-glow)) blur(${h.blur}px)`,
              animationName: "float-up",
              animationDuration: h.dur,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDelay: h.delay,
              "--dx": h.dx,
              "--r": h.rot,
              "--o": h.o,
            } as React.CSSProperties
          }
        >
          <path fill="currentColor" d="M50 92 C20 70 0 52 0 28 C0 12 12 0 27 0 C37 0 45 6 50 14 C55 6 63 0 73 0 C88 0 100 12 100 28 C100 52 80 70 50 92Z" />
        </svg>
      ))}
    </div>
  );
}

export function HeartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 92" className={className} style={style} aria-hidden>
      <path fill="currentColor" d="M50 92 C20 70 0 52 0 28 C0 12 12 0 27 0 C37 0 45 6 50 14 C55 6 63 0 73 0 C88 0 100 12 100 28 C100 52 80 70 50 92Z" />
    </svg>
  );
}
