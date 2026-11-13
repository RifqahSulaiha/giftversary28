import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { HeartBurst } from "./HeartBurst";
import { SectionTitle } from "./SectionTitle";
import { sfx } from "@/lib/love-audio";

export function LoveQuestions() {
  const { content } = useLove();
  const q = content.questions;
  const [a1, setA1] = useState<"yes" | "no" | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [burst, setBurst] = useState(0);
  const [a2, setA2] = useState<"a" | "b" | null>(null);
  const [burst2, setBurst2] = useState(0);

  return (
    <section id="questions" className="relative overflow-hidden px-5 py-28 bg-night">
      <SectionTitle eyebrow="A tiny interrogation" title="Answer Honestly 🥹" />
      <div className="mx-auto max-w-xl space-y-10">
        <div className="relative rounded-3xl glass p-7 text-center md:p-10">
          <HeartBurst burstKey={burst} count={24} />
          <p className="font-display text-2xl leading-snug text-cream md:text-3xl">{q.q1}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <button
              className="btn-love"
              onClick={() => {
                setA1("yes");
                setBurst((b) => b + 1);
                sfx("chime");
              }}
            >
              {q.q1Yes}
            </button>
            <motion.button
              key={noCount}
              className="btn-ghost-love"
              animate={noCount ? { x: [0, -12, 10, -6, 0] } : {}}
              transition={{ duration: 0.45 }}
              onClick={() => {
                setA1("no");
                setNoCount((n) => n + 1);
                sfx("wrong");
              }}
            >
              {q.q1No}
            </motion.button>
          </div>
          <AnimatePresence mode="wait">
            {a1 && (
              <motion.p
                key={a1 + noCount}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-7 font-sans text-lg font-extrabold tracking-wide ${a1 === "yes" ? "text-blush text-glow" : "text-rose-gold"}`}
              >
                {a1 === "yes" ? q.q1YesReply : q.q1NoReply}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {a1 === "yes" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative overflow-hidden rounded-3xl glass p-7 text-center md:p-10"
            >
              <HeartBurst burstKey={a2 === "a" ? burst2 : 0} count={30} spread={260} emoji="♾️" />
              <HeartBurst burstKey={a2 === "b" ? burst2 : 0} count={26} spread={240} emoji="🥰" />
              <p className="font-display text-2xl leading-snug text-cream md:text-3xl">{q.q2}</p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <button
                  className="btn-love"
                  onClick={() => {
                    setA2("a");
                    setBurst2((b) => b + 1);
                    sfx("win");
                  }}
                >
                  {q.q2A}
                </button>
                <button
                  className="btn-gold"
                  onClick={() => {
                    setA2("b");
                    setBurst2((b) => b + 1);
                    sfx("unlock");
                  }}
                >
                  {q.q2B}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {a2 === "a" && (
                  <motion.div key={`a${burst2}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
                    <svg viewBox="0 0 200 80" className="mx-auto h-16 w-40" aria-hidden>
                      <motion.path
                        d="M100 40 C 70 0, 20 0, 20 40 C 20 80, 70 80, 100 40 C 130 0, 180 0, 180 40 C 180 80, 130 80, 100 40 Z"
                        fill="none"
                        stroke="var(--rose-gold)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6, ease: "easeInOut" }}
                        style={{ filter: "drop-shadow(0 0 8px var(--cherry-glow))" }}
                      />
                    </svg>
                    <p className="mt-3 font-sans text-lg font-extrabold text-blush text-glow">{q.q2AReply}</p>
                  </motion.div>
                )}
                {a2 === "b" && (
                  <motion.div key={`b${burst2}`} initial={{ opacity: 0, scale: 0.6, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 180, damping: 12 }} className="mt-8">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose-gold text-4xl animate-heartbeat" style={{ boxShadow: "0 0 40px var(--rose-gold)" }}>
                      💍
                    </div>
                    <p className="mt-4 font-sans text-lg font-extrabold text-rose-gold">{q.q2BReply}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
