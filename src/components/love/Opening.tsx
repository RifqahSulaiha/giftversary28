import { useState } from "react";
import { motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { HeartScene } from "./HeartScene";
import { PetalField } from "./PetalField";
import { FloatingHearts } from "./FloatingHearts";
import { RevealWords } from "./RevealWords";
import { loveAudio, sfx } from "@/lib/love-audio";

export function Opening({ onOpen, onReady }: { onOpen: () => void; onReady: () => void }) {
  const { content } = useLove();
  const [zoom, setZoom] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const open = () => {
    if (leaving) return;
    setLeaving(true);
    sfx("chime");
    loveAudio().play();
    setZoom(1);
    window.setTimeout(onOpen, 900);
  };

  return (
    <section
      className="relative h-[100svh] min-h-[540px] overflow-hidden grain"
      style={{ background: "radial-gradient(90% 70% at 50% 35%, oklch(0.34 0.16 22) 0%, oklch(0.15 0.06 15) 50%, var(--noir) 100%)" }}
    >
      {/* slow camera drift */}
      <motion.div className="absolute inset-x-0 top-0 h-[64%]" animate={{ scale: [1, 1.06, 1], y: [0, -10, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}>
        <HeartScene variant="opening" zoomSignal={zoom} onReady={onReady} />
      </motion.div>
      <PetalField density={0.9} />
      <FloatingHearts count={8} stars={36} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, oklch(0 0 0 / 65%) 100%)" }} />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-[9svh] text-center"
        animate={leaving ? { opacity: 0, y: -30, filter: "blur(6px)" } : { opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-script text-[clamp(2.8rem,11vw,6.5rem)] leading-[1.05] text-romance text-glow">
          <RevealWords text={content.opening.greeting} delay={0.6} step={0.25} />
        </h1>
        <p className="mt-3 max-w-xl font-display text-xl text-cream/85 italic md:text-2xl">
          <RevealWords text={content.opening.subtitle} delay={1.6} step={0.08} />
        </p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.9 }}
          onClick={open}
          className="btn-love mt-8"
        >
          {content.opening.button}
        </motion.button>
      </motion.div>
    </section>
  );
}
