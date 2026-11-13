import { SectionTitle } from "./SectionTitle";
import { CatchMyLove } from "./games/CatchMyLove";
import { LoveQuiz } from "./games/LoveQuiz";
import { UnlockHeart } from "./games/UnlockHeart";

export function GamesSection() {
  return (
    <section id="games" className="relative overflow-hidden px-4 py-28" style={{ background: "linear-gradient(180deg, var(--noir), oklch(0.17 0.06 15) 40%, oklch(0.15 0.05 18) 70%, var(--noir))" }}>
      <SectionTitle eyebrow="Play with me" title="Three Lovely Games 🎮" sub="Win them all and you win… me. Again." />
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mx-auto max-w-3xl">
          <CatchMyLove />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <LoveQuiz />
          <UnlockHeart />
        </div>
      </div>
    </section>
  );
}
