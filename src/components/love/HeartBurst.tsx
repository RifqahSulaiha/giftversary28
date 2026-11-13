import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "./FloatingHearts";

/** A one-shot explosion of hearts. Change `burstKey` to fire again. */
export function HeartBurst({ burstKey, count = 18, spread = 220, emoji }: { burstKey: number; count?: number; spread?: number; emoji?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {burstKey > 0 &&
          Array.from({ length: count }, (_, i) => {
            const a = (i / count) * Math.PI * 2 + (burstKey % 7) * 0.3;
            const d = spread * (0.55 + ((i * 37) % 10) / 20);
            return (
              <motion.span
                key={`${burstKey}-${i}`}
                className="absolute"
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 60, scale: 0.6 + ((i * 13) % 10) / 12, opacity: 0, rotate: (i % 2 ? 1 : -1) * 60 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4 + (i % 5) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {emoji ? <span className="text-2xl">{emoji}</span> : <HeartIcon className="h-6 w-6 text-cherry-glow" style={{ filter: "drop-shadow(0 0 6px var(--cherry-glow))" }} />}
              </motion.span>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
