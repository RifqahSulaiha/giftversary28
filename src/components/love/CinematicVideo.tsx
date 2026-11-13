import { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { loveAudio } from "@/lib/love-audio";
import { HeartIcon } from "./FloatingHearts";
import { cn } from "@/lib/utils";

type Status = "loading" | "ready" | "error";

export function CinematicVideo({ src, poster, title, reel, decor = "glow" }: { src: string | undefined; poster: string | undefined; title: string; reel: number; decor?: "glow" | "film" | "tilt" }) {
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const [status, setStatus] = useState<Status>(src ? "loading" : "error");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  // Autoplay (muted) when the scene is on screen; pause when it leaves.
  useEffect(() => {
    const el = wrap.current;
    const v = video.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.intersectionRatio >= 0.55) {
          if (!userPaused.current && v.paused) v.play().catch(() => {});
        } else if (e.intersectionRatio < 0.15) {
          if (!v.paused) v.pause();
          userPaused.current = false;
        }
      },
      { threshold: [0, 0.15, 0.55, 0.8] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // Keep background music polite while this video plays with sound.
  useEffect(() => {
    if (playing && !muted) loveAudio().setDucked(true);
    else loveAudio().setDucked(false);
  }, [playing, muted]);
  useEffect(() => () => loveAudio().setDucked(false), []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const toggleMute = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const fullscreen = () => {
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.();
  };
  const retry = () => {
    setStatus("loading");
    video.current?.load();
  };

  return (
    <div
      ref={wrap}
      className={cn(
        "relative mx-auto aspect-[9/16] w-[min(78vw,360px)] max-h-[78svh] rounded-[1.75rem] p-[3px]",
        decor === "tilt" && "rotate-[2deg]",
      )}
      style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-glow)" }}
    >
      {decor === "film" && (
        <>
          <div aria-hidden className="absolute top-6 bottom-6 -left-5 w-3 rounded-sm" style={{ background: "repeating-linear-gradient(to bottom, var(--rose-gold) 0 10px, transparent 10px 20px)", opacity: 0.6 }} />
          <div aria-hidden className="absolute top-6 bottom-6 -right-5 w-3 rounded-sm" style={{ background: "repeating-linear-gradient(to bottom, var(--rose-gold) 0 10px, transparent 10px 20px)", opacity: 0.6 }} />
        </>
      )}
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-noir">
        {src && (
          <video
            ref={video}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            onCanPlay={() => setStatus("ready")}
            onLoadedData={() => setStatus("ready")}
            onWaiting={() => setStatus((s) => (s === "error" ? s : "loading"))}
            onPlaying={() => setStatus("ready")}
            onError={() => setStatus("error")}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              setProgress(v.duration ? v.currentTime / v.duration : 0);
            }}
            onClick={toggle}
          />
        )}
        {/* cinematic gradient */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-noir/30" />
        <div className="pointer-events-none absolute top-3 left-4 eyebrow text-cream/90">Reel {String(reel).padStart(2, "0")}</div>

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <HeartIcon className="h-10 w-10 text-cherry-glow animate-heartbeat" />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-noir/80 p-6 text-center">
            <div>
              <p className="font-display text-lg text-blush">This memory is taking a little nap.</p>
              <button onClick={retry} className="btn-ghost-love mt-4">
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
            </div>
          </div>
        )}
        {status !== "error" && !playing && (
          <button onClick={toggle} aria-label={`Play ${title}`} className="absolute inset-0 grid place-items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full glass glow-frame">
              <Play className="ml-1 h-8 w-8 text-cream" fill="currentColor" />
            </span>
          </button>
        )}

        {/* controls */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full glass px-2 py-1.5">
          <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-full text-cream hover:bg-cream/10" aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          </button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-cream/20">
            <div className="h-full rounded-full bg-rose-gold" style={{ width: `${progress * 100}%` }} />
          </div>
          <button onClick={toggleMute} className="grid h-9 w-9 place-items-center rounded-full text-cream hover:bg-cream/10" aria-label={muted ? "Unmute video" : "Mute video"}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={fullscreen} className="grid h-9 w-9 place-items-center rounded-full text-cream hover:bg-cream/10" aria-label="Full screen">
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
