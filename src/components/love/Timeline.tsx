import { useRef } from "react";
import { motion } from "framer-motion";
import { useLove } from "./LoveContext";
import { useGsap } from "./useGsap";
import { SectionTitle } from "./SectionTitle";
import { HeartIcon } from "./FloatingHearts";

export function Timeline() {
  const { content, url, openLightbox } = useLove();
  const ref = useRef<HTMLElement>(null);
  const items = content.timeline;
  useGsap(
    ref,
    (gsap) => {
      gsap.fromTo(".tl-progress", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".tl-list", start: "top 65%", end: "bottom 65%", scrub: 0.4 } });
    },
    [items.length],
  );
  if (items.length === 0) return null;
  return (
    <section ref={ref} id="timeline" className="relative overflow-hidden px-4 py-28" style={{ background: "radial-gradient(80% 50% at 50% 30%, oklch(0.2 0.07 20) 0%, var(--noir) 80%)" }}>
      <SectionTitle eyebrow="Our special memories" title="Our Little Timeline 🌷" sub="Every date that made us, us." />
      <div className="tl-list relative mx-auto max-w-5xl">
        <div aria-hidden className="absolute top-0 bottom-0 left-5 w-px bg-rose-gold/20 md:left-1/2" />
        <div aria-hidden className="tl-progress absolute top-0 bottom-0 left-5 w-[2px] origin-top -translate-x-[0.5px] md:left-1/2" style={{ background: "linear-gradient(var(--rose-gold), var(--cherry-glow))", boxShadow: "0 0 12px var(--cherry-glow)" }} />
        <ol className="space-y-14">
          {items.map((t, i) => {
            const left = i % 2 === 0;
            const src = url(t.photo);
            return (
              <li key={t.id} className="relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                <span className="absolute top-6 left-5 z-[1] grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-wine ring-2 ring-rose-gold/60 md:left-1/2">
                  <HeartIcon className="h-4 w-4 text-cherry-glow animate-heartbeat" />
                </span>
                <motion.div
                  initial={{ opacity: 0, x: left ? -60 : 60, rotate: left ? -3 : 3 }}
                  whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className={left ? "md:col-start-1 md:text-right" : "md:col-start-2"}
                >
                  <div className="overflow-hidden rounded-3xl glass">
                    {src && (
                      <button onClick={() => openLightbox(src, t.title)} className="block w-full overflow-hidden" aria-label={`Open photo: ${t.title}`}>
                        <img src={src} alt={t.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105" />
                      </button>
                    )}
                    <div className="p-6">
                      <p className="eyebrow">{t.date}</p>
                      <h3 className="mt-2 font-script text-4xl leading-tight text-romance">{t.title}</h3>
                      <p className="mt-3 font-display text-lg leading-relaxed text-cream/85 italic">{t.description}</p>
                    </div>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
