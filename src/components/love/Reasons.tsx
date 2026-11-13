import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { SectionTitle } from "./SectionTitle";
import { HeartIcon } from "./FloatingHearts";
import { HeartBurst } from "./HeartBurst";
import { sfx } from "@/lib/love-audio";

const STEP = 24;

export function Reasons() {
  const { content } = useLove();
  const reasons = content.reasons;
  const [shown, setShown] = useState(STEP);
  const [pick, setPick] = useState(0);
  const [burst, setBurst] = useState(0);
  const total = reasons.length;
  const visible = reasons.slice(0, Math.min(shown, total));

  const another = () => {
    if (total < 2) return;
    let n = pick;
    while (n === pick) n = Math.floor(Math.random() * total);
    setPick(n);
    setBurst((b) => b + 1);
    sfx("pop");
  };

  return (
    <section id="reasons" className="relative overflow-hidden px-4 py-28 bg-night">
      <SectionTitle eyebrow={`${total} little reasons`} title={`${total} Little Reasons Why I Love You`} sub="I tried to stop at a hundred. My heart kept writing." />

      {/* featured reason */}
      <div className="relative mx-auto mb-16 max-w-xl">
        <HeartBurst burstKey={burst} count={14} spread={200} />
        <div className="relative overflow-hidden rounded-[2rem] p-[2px]" style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-glow)" }}>
          <div className="relative rounded-[1.9rem] bg-wine px-6 py-10 text-center">
            <HeartIcon className="absolute -top-10 -right-10 h-40 w-40 text-cherry/25" />
            <p className="eyebrow">Reason No. {String(pick + 1).padStart(3, "0")}</p>
            <div className="mt-4 min-h-[5.5rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={pick}
                  initial={{ opacity: 0, rotateX: -70, y: 10 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, rotateX: 70, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="font-display text-2xl leading-snug text-cream italic md:text-3xl"
                >
                  {reasons[pick] ?? reasons[0]}
                </motion.p>
              </AnimatePresence>
            </div>
            <button onClick={another} className="btn-love mt-6">
              ANOTHER REASON 💕
            </button>
          </div>
        </div>
      </div>

      <ol className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((r, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
            className="group relative overflow-hidden rounded-2xl glass p-5"
          >
            <span aria-hidden className="absolute -right-3 -bottom-4 font-script text-7xl text-cherry-glow/15 transition group-hover:text-cherry-glow/30">
              {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <HeartIcon className="h-3.5 w-3.5 text-cherry-glow" />
              <span className="eyebrow">No. {String(i + 1).padStart(3, "0")}</span>
            </div>
            <p className="relative mt-3 font-display text-lg leading-snug text-cream/95">{r}</p>
          </motion.li>
        ))}
      </ol>

      {shown < total && (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setShown((s) => s + STEP);
              sfx("click");
            }}
            className="btn-ghost-love"
          >
            SHOW {Math.min(STEP, total - shown)} MORE REASONS ♡
          </button>
          <button
            onClick={() => {
              setShown(total);
              sfx("click");
            }}
            className="btn-ghost-love"
          >
            SHOW ALL {total}
          </button>
        </div>
      )}
    </section>
  );
}
