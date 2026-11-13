import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useLove } from "./LoveContext";

export function Lightbox() {
  const { lightbox, closeLightbox } = useLove();
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);
  return (
    <AnimatePresence>
      {lightbox && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-noir/95 p-3 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLightbox}
          role="dialog"
          aria-label={lightbox.alt}
        >
          <motion.img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[92svh] max-w-full rounded-xl object-contain glow-frame"
            initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full glass text-cream"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
