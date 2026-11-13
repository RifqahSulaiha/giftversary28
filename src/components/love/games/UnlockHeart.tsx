import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useLove } from "../LoveContext";
import { HeartBurst } from "../HeartBurst";
import { codeMatches, normalizeCode } from "@/lib/content-types";
import { sfx } from "@/lib/love-audio";

export function UnlockHeart() {
  const { content } = useLove();
  const len = Math.max(1, Math.min(12, normalizeCode(content.puzzle.code).length || 8));
  const [digits, setDigits] = useState<number[]>(() => Array(len).fill(0));
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"locked" | "wrong" | "open">("locked");
  const [attempt, setAttempt] = useState(0);
  const [burst, setBurst] = useState(0);
  const list = digits.length === len ? digits : Array(len).fill(0);

  const bump = (i: number, d: number) => {
    setDigits((prev) => {
      const base = prev.length === len ? [...prev] : Array(len).fill(0);
      base[i] = ((base[i] ?? 0) + d + 10) % 10;
      return base;
    });
    setState("locked");
    sfx("click");
  };
  const tryOpen = () => {
    if (codeMatches(list.join(""), content.puzzle.code)) {
      setState("open");
      setBurst((b) => b + 1);
      sfx("unlock");
    } else {
      setState("wrong");
      setAttempt((a) => a + 1);
      sfx("wrong");
    }
  };
  // Separator positions follow the format of the saved code (e.g. 28-11-2026 -> after 2 and 4).
  const seps: number[] = [];
  {
    let count = 0;
    for (const ch of content.puzzle.code) {
      if (/\d/.test(ch)) count++;
      else if (count > 0) seps.push(count);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl glass p-5 md:p-7">
      <HeartBurst burstKey={burst} count={28} spread={240} />
      <p className="eyebrow">Game 3</p>
      <h3 className="font-display text-2xl text-cream">Unlock My Heart 🔐</h3>
      <p className="mt-1 text-sm text-muted-foreground">Turn the dials to the secret code to open my heart-lock.</p>

      <div className="mt-6 flex justify-center">
        <motion.div key={attempt} animate={state === "wrong" ? { x: [0, -14, 12, -8, 6, 0] } : {}} transition={{ duration: 0.5 }} className="relative h-36 w-32">
          <motion.svg viewBox="0 0 120 70" className="absolute top-0 left-1/2 h-20 w-24 -translate-x-1/2" animate={state === "open" ? { y: -18, rotate: -18, x: -8 } : { y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 140, damping: 10 }}>
            <path d="M30 70 V38 a30 30 0 0 1 60 0 V70" fill="none" stroke="var(--rose-gold)" strokeWidth="10" strokeLinecap="round" />
          </motion.svg>
          <svg viewBox="0 0 100 92" className="absolute bottom-0 left-1/2 h-24 w-28 -translate-x-1/2" style={{ filter: `drop-shadow(0 0 ${state === "open" ? 26 : 12}px var(--cherry-glow))` }}>
            <path fill={state === "open" ? "var(--cherry-glow)" : "var(--cherry)"} d="M50 92 C20 70 0 52 0 28 C0 12 12 0 27 0 C37 0 45 6 50 14 C55 6 63 0 73 0 C88 0 100 12 100 28 C100 52 80 70 50 92Z" />
            <circle cx="50" cy="40" r="7" fill="var(--noir)" opacity={state === "open" ? 0 : 0.7} />
            <rect x="47" y="44" width="6" height="14" rx="2" fill="var(--noir)" opacity={state === "open" ? 0 : 0.7} />
          </svg>
        </motion.div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
        {list.map((d, i) => (
          <div key={i} className="flex items-center">
            {seps.includes(i) && <span className="mx-0.5 font-sans text-xl font-bold text-rose-gold">-</span>}
            <div className="flex flex-col items-center">
              <button onClick={() => bump(i, 1)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-gold hover:bg-cream/10" aria-label={`Increase digit ${i + 1}`}>
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="grid h-11 w-8 place-items-center rounded-lg bg-noir/60 font-sans text-xl font-extrabold text-cream tabular-nums gold-border sm:w-9">{d}</span>
              <button onClick={() => bump(i, -1)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-gold hover:bg-cream/10" aria-label={`Decrease digit ${i + 1}`}>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-love" onClick={tryOpen}>
          UNLOCK 💗
        </button>
        <button className="btn-ghost-love" onClick={() => setHints((h) => Math.min(content.puzzle.hints.length, h + 1))} disabled={hints >= content.puzzle.hints.length}>
          <Lightbulb className="h-4 w-4" /> HINT ({hints}/{content.puzzle.hints.length})
        </button>
      </div>
      {state === "wrong" && <p className="mt-4 text-center font-sans font-bold text-blush">Not quite, my love… try again! 🙈</p>}
      <ul className="mt-4 space-y-2">
        {content.puzzle.hints.slice(0, hints).map((h, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-noir/40 px-4 py-2.5 text-sm text-cream/90">
            <span className="mr-2 text-rose-gold">Hint {i + 1}:</span>
            {h}
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {state === "open" && (
          <motion.div initial={{ opacity: 0, y: 30, rotateX: -60 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="mt-6 rounded-2xl bg-paper-texture p-6 text-ink shadow-2xl" style={{ transformOrigin: "top" }}>
            <p className="font-sans text-xs font-bold tracking-[0.3em] text-cherry uppercase">Secret letter unlocked</p>
            <p className="mt-3 font-hand text-2xl leading-relaxed whitespace-pre-line">{content.puzzle.secretLetter}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
