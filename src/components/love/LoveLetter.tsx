import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { HeartBurst } from "./HeartBurst";
import { FloatingHearts, HeartIcon } from "./FloatingHearts";
import { sfx } from "@/lib/love-audio";

type Phase = "closed" | "opening" | "open";

export function LoveLetter() {
  const { content } = useLove();
  const l = content.letter;
  const [phase, setPhase] = useState<Phase>("closed");
  const [burst, setBurst] = useState(0);
  const letterRef = useRef<HTMLDivElement>(null);
  const isOpen = phase !== "closed";

  const open = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    sfx("chime");
    window.setTimeout(() => {
      setPhase("open");
      setBurst((b) => b + 1);
      sfx("win");
      window.setTimeout(() => letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }, 1700);
  };
  const close = () => {
    setPhase("closed");
    sfx("click");
  };

  return (
    <section id="letter" className="relative overflow-hidden px-4 py-28" style={{ background: "radial-gradient(70% 50% at 50% 35%, oklch(0.26 0.1 18) 0%, oklch(0.12 0.03 15) 75%)" }}>
      {phase === "open" && <FloatingHearts count={14} stars={0} />}
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">A letter from my heart 💌</p>
        <h2 className="mt-4 font-display text-3xl text-cream italic md:text-4xl text-glow">{l.teaser}</h2>
      </div>

      {/* 3D envelope */}
      <div className="relative mx-auto mt-14 w-[min(88vw,440px)]" style={{ perspective: 1400 }}>
        <HeartBurst burstKey={burst} count={26} spread={260} />
        <motion.div
          className="relative aspect-[7/5] w-full"
          animate={phase === "closed" ? { rotateX: [8, 4, 8], y: [0, -8, 0] } : { rotateX: 0, y: 40 }}
          transition={phase === "closed" ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* back */}
          <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(160deg, oklch(0.32 0.12 15), oklch(0.2 0.08 15))", boxShadow: "0 40px 70px -25px oklch(0 0 0 / 85%)" }} />
          {/* letter paper */}
          <motion.div
            className="absolute inset-x-[7%] top-[6%] bottom-[6%] z-10 rounded-md bg-paper-texture p-5 text-left"
            animate={{ y: isOpen ? "-58%" : "0%" }}
            transition={{ duration: 0.9, delay: isOpen ? 0.65 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-hand text-2xl text-ink">{l.greeting}</p>
            <div className="mt-2 space-y-2">
              {[90, 75, 85, 60].map((w, i) => (
                <div key={i} className="h-[2px] rounded bg-ink/15" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>
          {/* front pocket */}
          <div
            className="absolute inset-0 z-20 rounded-xl"
            style={{
              clipPath: "polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)",
              background: "linear-gradient(200deg, oklch(0.4 0.15 18), oklch(0.27 0.1 15))",
            }}
          />
          <div aria-hidden className="absolute inset-0 z-20 rounded-xl ring-1 ring-rose-gold/30" />
          {/* flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[60%] origin-top"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(180deg, oklch(0.45 0.16 18), oklch(0.33 0.13 15))", zIndex: phase === "closed" ? 30 : 5, backfaceVisibility: "visible" }}
            animate={{ rotateX: isOpen ? 180 : 0 }}
            transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* wax seal */}
          <AnimatePresence>
            {!isOpen && (
              <motion.button
                key="seal"
                onClick={open}
                exit={{ scale: 0, opacity: 0, rotate: 40 }}
                whileHover={{ scale: 1.08 }}
                className="absolute top-[60%] left-1/2 z-40 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ background: "radial-gradient(circle at 35% 30%, oklch(0.6 0.2 22), oklch(0.38 0.16 18))", boxShadow: "0 6px 16px oklch(0 0 0 / 50%), inset 0 2px 4px oklch(1 0 0 / 25%)" }}
                aria-label="Open the envelope"
              >
                <HeartIcon className="h-7 w-7 text-blush" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-20 text-center">
        {phase === "closed" && (
          <button onClick={open} className="btn-love">
            OPEN MY LETTER 💗
          </button>
        )}
        {phase === "opening" && <p className="font-display text-lg text-blush italic">Unfolding my heart…</p>}
      </div>

      {/* the unfolded letter */}
      <div ref={letterRef} className="scroll-mt-16" style={{ perspective: 1600 }}>
        <AnimatePresence>
          {phase === "open" && (
            <motion.article
              key="letter"
              initial={{ opacity: 0, rotateX: -75, scaleY: 0.35, y: -40 }}
              animate={{ opacity: 1, rotateX: 0, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.3 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto mt-2 max-w-2xl origin-top rounded-sm bg-paper-texture px-6 py-10 text-ink md:px-12 md:py-14"
              style={{ boxShadow: "0 40px 80px -30px oklch(0 0 0 / 90%), inset 0 0 60px oklch(0.6 0.08 60 / 25%)" }}
            >
              <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-ink/10" initial={{ opacity: 1 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.4, duration: 1 }} />
              <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-ink/10" initial={{ opacity: 1 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.4, duration: 1 }} />
              <HeartIcon className="absolute top-6 right-6 h-8 w-8 text-cherry/60" />
              <p className="font-hand text-4xl">{l.greeting}</p>
              <div className="mt-6 space-y-5">
                {l.body.split(/\n{2,}/).map((para, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.45, duration: 0.8 }} className="font-hand text-[1.6rem] leading-snug whitespace-pre-line">
                    {para}
                  </motion.p>
                ))}
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 + l.body.split(/\n{2,}/).length * 0.45 }} className="mt-10 text-right font-script text-4xl text-cherry">
                {l.signoff}
              </motion.p>
              <div className="mt-8 text-center">
                <button onClick={close} className="btn-ghost-love border-ink/30 bg-ink/10 text-ink hover:bg-ink/20 hover:text-ink">
                  Fold it back ♡
                </button>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
