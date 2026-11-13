import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLove } from "../LoveContext";
import { HeartBurst } from "../HeartBurst";
import { sfx } from "@/lib/love-audio";

const YAY = ["Yayyy! You know me so well 😍", "Correct, my genius! 🥰", "100 points for my baby! 💯", "Aww you remembered! 😭❤️"];
const NAY = ["Hmm… you owe me a hug for that 😤", "Wrong! Kiss penalty applied 😘", "Ayyo! How could you 🙈", "Nope! Try harder, cutie 😂"];

export function LoveQuiz() {
  const { content } = useLove();
  const quiz = content.quiz;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const q = quiz[i];

  const pick = (idx: number) => {
    if (picked !== null || !q) return;
    setPicked(idx);
    if (idx === q.answer) {
      setScore((s) => s + 1);
      setBurst((b) => b + 1);
      sfx("chime");
    } else sfx("wrong");
  };
  const next = () => {
    if (i + 1 >= quiz.length) {
      setDone(true);
      setBurst((b) => b + 1);
      sfx("win");
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };
  const restart = () => {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };
  const correct = picked !== null && q && picked === q.answer;

  return (
    <div className="relative overflow-hidden rounded-3xl glass p-5 md:p-7">
      <HeartBurst burstKey={burst} count={16} spread={180} />
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Game 2</p>
          <h3 className="font-display text-2xl text-cream">How Well Do You Know Us? 💗</h3>
        </div>
        {!done && (
          <p className="font-sans text-sm font-bold text-rose-gold tabular-nums">
            {i + 1}/{quiz.length}
          </p>
        )}
      </div>
      <div className="mt-5 min-h-[340px]">
        <AnimatePresence mode="wait">
          {!done && q ? (
            <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
              <p className="font-display text-xl leading-snug text-cream md:text-2xl">{q.question}</p>
              <div className="mt-5 grid gap-3">
                {q.options.map((o, idx) => {
                  const isAns = picked !== null && idx === q.answer;
                  const isWrong = picked === idx && idx !== q.answer;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => pick(idx)}
                      animate={isWrong ? { x: [0, -8, 8, -4, 0] } : {}}
                      className={`rounded-2xl border px-4 py-3.5 text-left font-sans font-semibold transition-colors ${
                        isAns ? "border-success bg-success/20 text-cream" : isWrong ? "border-destructive bg-destructive/20 text-cream" : "border-border bg-noir/40 text-cream/90 hover:border-rose-gold"
                      }`}
                    >
                      {o}
                    </motion.button>
                  );
                })}
              </div>
              {picked !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className={`font-sans font-bold ${correct ? "text-success" : "text-blush"}`}>{(correct ? YAY : NAY)[i % 4]}</p>
                  <button className="btn-love" onClick={next}>
                    {i + 1 >= quiz.length ? "SEE MY SCORE" : "NEXT →"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[300px] place-items-center text-center">
              <div>
                <p className="font-sans text-6xl font-extrabold text-cream">
                  {score}/{quiz.length}
                </p>
                <p className="mt-3 font-script text-4xl text-romance">
                  {score === quiz.length ? "Perfect! You know us by heart 💯" : score >= quiz.length / 2 ? "So good! My heart is proud 🥰" : "Looks like we need more dates 😂❤️"}
                </p>
                <button className="btn-ghost-love mt-6" onClick={restart}>
                  PLAY AGAIN ↻
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
