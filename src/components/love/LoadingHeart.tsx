import { HeartIcon } from "./FloatingHearts";

export function LoadingHeart({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-night" role="status" aria-live="polite">
      <div className="text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-[-24px] rounded-full bg-cherry-glow/30 blur-2xl animate-glow-pulse" />
          <HeartIcon className="relative h-20 w-20 text-cherry-glow animate-heartbeat" style={{ filter: "drop-shadow(0 0 16px var(--cherry-glow))" }} />
        </div>
        <p className="mt-6 font-display text-xl text-blush italic">{label}</p>
      </div>
    </div>
  );
}
