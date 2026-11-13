import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import type { LoveContent, SignedUrls } from "@/lib/content-types";
import { LoveProvider } from "./LoveContext";
import { Opening } from "./Opening";
import { MemoryStory } from "./MemoryStory";
import { LoveQuestions } from "./LoveQuestions";
import { GamesSection } from "./GamesSection";
import { Reasons } from "./Reasons";
import { Timeline } from "./Timeline";
import { LoveLetter } from "./LoveLetter";
import { Finale } from "./Finale";
import { Lightbox } from "./Lightbox";
import { MusicDock } from "./MusicDock";
import { Editor } from "./Editor";
import { LoadingHeart } from "./LoadingHeart";
import { ensureGsap } from "./useGsap";

export function LoveExperience({ initial }: { initial: { content: LoveContent; urls: SignedUrls } }) {
  return (
    <LoveProvider initial={initial}>
      <Experience />
    </LoveProvider>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[85] h-[3px] origin-left" style={{ scaleX, background: "var(--gradient-rose-gold)" }} />;
}

function Experience() {
  const [stage, setStage] = useState<"opening" | "story">("opening");
  const [curtain, setCurtain] = useState(false);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  const go = (next: "opening" | "story") => {
    setCurtain(true);
    window.setTimeout(() => {
      setStage(next);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      window.setTimeout(() => {
        setCurtain(false);
        ensureGsap().ScrollTrigger.refresh();
      }, 400);
    }, 750);
  };

  return (
    <>
      {stage === "opening" ? (
        <Opening onOpen={() => go("story")} onReady={() => setReady(true)} />
      ) : (
        <main className="relative">
          <ScrollProgress />
          <MemoryStory />
          <LoveQuestions />
          <GamesSection />
          <Reasons />
          <Timeline />
          <LoveLetter />
          <Finale onRelive={() => go("opening")} />
        </main>
      )}

      <MusicDock onEdit={() => setEditing(true)} />
      <Lightbox />
      <Editor open={editing} onClose={() => setEditing(false)} />

      <AnimatePresence>
        {curtain && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-[95]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle at 50% 45%, oklch(0.7 0.2 18) 0%, oklch(0.35 0.15 18) 30%, var(--noir) 75%)" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!ready && (
          <motion.div key="pre" exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="fixed inset-0 z-[100]">
            <LoadingHeart label="Preparing your little world…" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
