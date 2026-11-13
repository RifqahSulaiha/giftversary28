import { motion } from "framer-motion";

/** Reveals text word by word with a soft blur, like movie titles. */
export function RevealWords({ text, className, delay = 0, step = 0.12, inView = false }: { text: string; className?: string; delay?: number; step?: number; inView?: boolean }) {
  const words = text.split(/\s+/).filter(Boolean);
  const anim = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          {...(inView ? { whileInView: anim, viewport: { once: true, amount: 0.6 } } : { animate: anim })}
          transition={{ duration: 0.9, delay: delay + i * step, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
