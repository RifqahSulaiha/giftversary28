import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "../FloatingHearts";
import { HeartBurst } from "../HeartBurst";
import { sfx } from "@/lib/love-audio";

type Heart = { id: number; x: number; y: number; speed: number; size: number; gold: boolean; sway: number };
const DURATION = 30;

export function CatchMyLove() {
  const area = useRef<HTMLDivElement>(null);
  const hearts = useRef<Heart[]>([]);
  const nodes = useRef(new Map<number, HTMLButtonElement>());
  const [ids, setIds] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; txt: string }[]>([]);
  const [burst, setBurst] = useState(0);
  const nextId = useRef(1);

  const start = () => {
    hearts.current = [];
    nodes.current.clear();
    setIds([]);
    setScore(0);
    setTime(DURATION);
    setPhase("play");
    sfx("click");
  };

  // timer
  useEffect(() => {
    if (phase !== "play") return;
    const startAt = performance.now();
    const t = window.setInterval(() => {
      const left = Math.max(0, DURATION - Math.floor((performance.now() - startAt) / 1000));
      setTime(left);
      if (left <= 0) {
        setPhase("done");
        setBurst((b) => b + 1);
        sfx("win");
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [phase]);

  // game loop
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      const el = area.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      spawnAcc += dt;
      if (spawnAcc > 0.5 && hearts.current.length < 14) {
        spawnAcc = 0;
        const size = 34 + Math.random() * 22;
        const heart: Heart = { id: nextId.current++, x: Math.random() * (w - size), y: -size, speed: 110 + Math.random() * 120, size, gold: Math.random() < 0.12, sway: Math.random() * Math.PI * 2 };
        hearts.current.push(heart);
        setIds((p) => [...p, heart.id]);
      }
      const gone: number[] = [];
      for (const ht of hearts.current) {
        ht.y += ht.speed * dt;
        ht.sway += dt * 2;
        const node = nodes.current.get(ht.id);
        if (node) node.style.transform = `translate3d(${ht.x + Math.sin(ht.sway) * 10}px, ${ht.y}px, 0)`;
        if (ht.y > h + 10) gone.push(ht.id);
      }
      if (gone.length) {
        hearts.current = hearts.current.filter((x) => !gone.includes(x.id));
        setIds((p) => p.filter((id) => !gone.includes(id)));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const catchHeart = useCallback((id: number) => {
    const ht = hearts.current.find((x) => x.id === id);
    if (!ht) return;
    hearts.current = hearts.current.filter((x) => x.id !== id);
    setIds((p) => p.filter((x) => x !== id));
    const pts = ht.gold ? 3 : 1;
    setScore((s) => s + pts);
    const popId = nextId.current++;
    setPops((p) => [...p, { id: popId, x: ht.x + ht.size / 2, y: ht.y, txt: `+${pts}` }]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== popId)), 700);
    sfx("pop");
  }, []);

  return (
    <div className="relative rounded-3xl glass p-5 md:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Game 1</p>
          <h3 className="font-display text-2xl text-cream">Catch My Love ❤️</h3>
        </div>
        <div className="flex gap-3 text-right">
          <div className="rounded-2xl bg-noir/50 px-3 py-1.5">
            <p className="text-[0.6rem] tracking-widest text-rose-gold uppercase">Score</p>
            <p className="font-sans text-xl font-extrabold text-cream tabular-nums">{score}</p>
          </div>
          <div className="rounded-2xl bg-noir/50 px-3 py-1.5">
            <p className="text-[0.6rem] tracking-widest text-rose-gold uppercase">Time</p>
            <p className="font-sans text-xl font-extrabold text-cream tabular-nums">{time}s</p>
          </div>
        </div>
      </div>
      <div ref={area} className="relative mt-5 h-[420px] touch-manipulation overflow-hidden rounded-2xl bg-noir/60 select-none" style={{ backgroundImage: "radial-gradient(60% 50% at 50% 100%, oklch(0.3 0.12 18 / 60%), transparent)" }}>
        {ids.map((id) => {
          const ht = hearts.current.find((x) => x.id === id);
          if (!ht) return null;
          return (
            <button
              key={id}
              ref={(n) => {
                if (n) nodes.current.set(id, n);
                else nodes.current.delete(id);
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                catchHeart(id);
              }}
              className="absolute top-0 left-0 p-1"
              style={{ width: ht.size + 8, height: ht.size + 8, transform: `translate3d(${ht.x}px, ${ht.y}px, 0)` }}
              aria-label="Catch heart"
            >
              <HeartIcon className={ht.gold ? "h-full w-full text-rose-gold" : "h-full w-full text-cherry-glow"} style={{ filter: `drop-shadow(0 0 10px ${ht.gold ? "var(--rose-gold)" : "var(--cherry-glow)"})` }} />
            </button>
          );
        })}
        {pops.map((p) => (
          <motion.span key={p.id} className="pointer-events-none absolute font-sans text-lg font-extrabold text-blush" style={{ left: p.x, top: p.y }} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.7 }}>
            {p.txt}
          </motion.span>
        ))}
        <HeartBurst burstKey={burst} count={26} spread={200} />
        <AnimatePresence>
          {phase !== "play" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-noir/70 p-6 text-center backdrop-blur-sm">
              <div>
                {phase === "idle" ? (
                  <>
                    <p className="font-display text-xl text-cream/90 italic">Tap the falling hearts! Golden ones are worth 3.</p>
                    <p className="mt-1 text-sm text-muted-foreground">You have 30 seconds.</p>
                  </>
                ) : (
                  <>
                    <p className="font-sans text-5xl font-extrabold text-cream">{score}</p>
                    <p className="text-sm tracking-widest text-rose-gold uppercase">hearts caught</p>
                    <p className="mt-4 font-script text-4xl text-romance">You caught my heart, and you have it forever!</p>
                  </>
                )}
                <button className="btn-love mt-6" onClick={start}>
                  {phase === "idle" ? "START CATCHING 💘" : "PLAY AGAIN ↻"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
