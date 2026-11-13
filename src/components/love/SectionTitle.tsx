import { motion } from "framer-motion";

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-12 max-w-2xl text-center"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-script text-5xl leading-tight text-romance md:text-7xl">{title}</h2>
      {sub && <p className="mt-4 font-display text-lg text-cream/75 italic md:text-xl">{sub}</p>}
    </motion.div>
  );
}
