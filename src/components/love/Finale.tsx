import { motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { HeartScene } from "./HeartScene";
import { PetalField } from "./PetalField";
import { RevealWords } from "./RevealWords";
import { sfx } from "@/lib/love-audio";

export function Finale({ onRelive }: { onRelive: () => void }) {
  const { content, url, openLightbox } = useLove();
  const f = content.finale;
  const src = url(f.photo);
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.5 },
    transition: { duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section id="finale" className="relative overflow-hidden pb-28 grain" style={{ background: "radial-gradient(90% 60% at 50% 25%, oklch(0.3 0.15 22) 0%, oklch(0.16 0.07 15) 45%, var(--noir) 100%)" }}>
      <PetalField density={1.2} />
      <div className="relative h-[68svh] min-h-[420px]">
        <HeartScene variant="finale" />
        <div className="absolute inset-x-0 bottom-4 z-10 px-5 text-center">
          <motion.p {...fade(0.2)} className="eyebrow">
            Final surprise · Our forever
          </motion.p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,9vw,5.5rem)] font-semibold tracking-[0.12em] text-romance text-glow">
            <RevealWords text={f.date} inView step={0.3} delay={0.4} />
          </h2>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <motion.p {...fade(0.3)} className="font-display text-2xl text-cream/90 italic md:text-3xl">
          {f.line1}
        </motion.p>

        {src && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => openLightbox(src, "Our favourite photograph")}
            className="relative mx-auto mt-14 block w-[min(80vw,380px)]"
            aria-label="Open our favourite photograph"
          >
            <div className="absolute inset-[-14%] rounded-full bg-cherry-glow/35 blur-3xl animate-glow-pulse" />
            <div className="relative rounded-[2rem] p-[3px]" style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-glow)" }}>
              <img src={src} alt="Our favourite photograph" loading="lazy" className="aspect-[4/5] w-full rounded-[1.85rem] object-cover" />
            </div>
          </motion.button>
        )}

        <motion.p {...fade(0.2)} className="mt-14 font-display text-2xl leading-relaxed text-cream md:text-4xl">
          {f.line2}
        </motion.p>
        <motion.h3 {...fade(0.5)} className="mt-14 font-script text-[clamp(2.6rem,10vw,5.5rem)] leading-tight text-romance text-glow">
          {f.final}
        </motion.h3>
        <motion.div {...fade(0.9)} className="mt-12">
          <button
            onClick={() => {
              sfx("chime");
              onRelive();
            }}
            className="btn-gold"
          >
            RELIVE OUR LOVE STORY ↻
          </button>
        </motion.div>
      </div>
    </section>
  );
}
