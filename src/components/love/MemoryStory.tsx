import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Expand } from "lucide-react";
import { useLove } from "./LoveContext";
import { useGsap } from "./useGsap";
import { CinematicVideo } from "./CinematicVideo";
import { HeartIcon } from "./FloatingHearts";
import type { StoryItem } from "@/lib/content-types";

function SceneText({ n, kind, title, caption, align = "center" }: { n: number; kind: string; title: string; caption: string; align?: "center" | "left" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={align === "center" ? "mx-auto max-w-md text-center" : "max-w-md text-center md:text-left"}
    >
      <p className="eyebrow">
        Scene {String(n).padStart(2, "0")} · {kind}
      </p>
      <h3 className="mt-3 font-script text-5xl leading-tight text-romance md:text-6xl">{title}</h3>
      <p className="mt-4 font-display text-xl leading-relaxed text-cream/90 italic md:text-2xl">{caption}</p>
    </motion.div>
  );
}

function ZoomHint() {
  return (
    <span className="pointer-events-none absolute right-3 bottom-3 z-[2] grid h-9 w-9 place-items-center rounded-full glass text-cream/90">
      <Expand className="h-4 w-4" />
    </span>
  );
}

function SceneShell({ children, tone, className = "" }: { children: ReactNode; tone: string; className?: string }) {
  return (
    <section className={`relative flex min-h-[110svh] items-center justify-center overflow-hidden px-5 py-24 ${className}`} style={{ background: tone }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-noir to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-noir to-transparent" />
      {children}
    </section>
  );
}

/* Scene: cinematic zoom with letterbox bars */
function CinemaZoom({ item, n }: { item: StoryItem; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const { url, openLightbox } = useLove();
  const src = url(item.path);
  useGsap(ref, (gsap) => {
    gsap.fromTo(".cz-img", { scale: 1.55 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "center center", scrub: 0.6 } });
    gsap
      .timeline({ scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } })
      .fromTo(".cz-frame", { y: 120, rotateX: 18, opacity: 0.2, scale: 1 }, { y: 0, rotateX: 0, opacity: 1, ease: "power2.out", duration: 1 })
      .to(".cz-frame", { y: -80, scale: 0.94, opacity: 0.4, ease: "none", duration: 1 });
    gsap.fromTo(".cz-bar", { scaleY: 1 }, { scaleY: 0.25, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 70%", end: "center center", scrub: 0.6 } });
  }, [src]);
  return (
    <section ref={ref} className="relative min-h-[120svh] overflow-hidden px-5 py-28" style={{ background: "radial-gradient(90% 60% at 50% 40%, oklch(0.26 0.1 18) 0%, var(--noir) 75%)" }}>
      <div className="cz-bar pointer-events-none absolute inset-x-0 top-0 h-[16svh] origin-top bg-noir" />
      <div className="cz-bar pointer-events-none absolute inset-x-0 bottom-0 h-[16svh] origin-bottom bg-noir" />
      <div className="relative z-[1] mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:justify-center" style={{ perspective: 1200 }}>
        <button
          onClick={() => src && openLightbox(src, item.title)}
          className="cz-frame relative aspect-[3/4] w-[min(84vw,430px)] overflow-hidden rounded-2xl glow-frame vignette"
          aria-label={`Open photo: ${item.title}`}
        >
          {src && <img src={src} alt={item.title} className="cz-img h-full w-full object-cover" loading="lazy" />}
          <ZoomHint />
        </button>
        <SceneText n={n} kind="Photograph" title={item.title} caption={item.caption} align="left" />
      </div>
    </section>
  );
}

/* Scene: floating polaroid with 3D tilt */
function PolaroidFloat({ item, n }: { item: StoryItem; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const { url, openLightbox } = useLove();
  const src = url(item.path);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [14, -14]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-16, 16]), { stiffness: 120, damping: 14 });
  useGsap(ref, (gsap) => {
    gsap.fromTo(".pf-card", { y: 160, rotate: -14, scale: 0.8, opacity: 0 }, { y: 0, rotate: -4, scale: 1, opacity: 1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 85%", end: "center 60%", scrub: 0.7 } });
    gsap.to(".pf-hearts", { y: -160, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.5 } });
  }, [src]);
  return (
    <SceneShell tone="radial-gradient(70% 50% at 50% 50%, oklch(0.3 0.11 12 / 90%) 0%, oklch(0.14 0.04 15) 70%)">
      <section ref={ref} className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center gap-12 md:flex-row-reverse md:justify-center">
        <div className="pf-hearts pointer-events-none absolute inset-0" aria-hidden>
          {[8, 22, 78, 88, 60].map((l, i) => (
            <HeartIcon key={i} className="absolute text-cherry-glow/40" style={{ left: `${l}%`, top: `${20 + i * 14}%`, width: 14 + i * 6, height: 14 + i * 6 }} />
          ))}
        </div>
        <div className="pf-card" style={{ perspective: 1000 }}>
          <motion.button
            className="relative block bg-cream p-3 pb-16 polaroid-shadow"
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
              my.set(((e.clientY - r.top) / r.height) * 2 - 1);
            }}
            onPointerLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            onClick={() => src && openLightbox(src, item.title)}
            aria-label={`Open photo: ${item.title}`}
          >
            <span aria-hidden className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-[-3deg] bg-blush/70" />
            <div className="animate-bob">
              <div className="relative aspect-[4/5] w-[min(74vw,360px)] overflow-hidden bg-noir">
                {src && <img src={src} alt={item.title} className="h-full w-full object-cover" loading="lazy" />}
                <ZoomHint />
              </div>
            </div>
            <span className="absolute inset-x-0 bottom-3 text-center font-hand text-3xl text-ink">{item.title} ♡</span>
          </motion.button>
        </div>
        <SceneText n={n} kind="Polaroid" title={item.title} caption={item.caption} align="left" />
      </section>
    </SceneShell>
  );
}

/* Scene: scrapbook stack with doodles */
function Scrapbook({ item, n }: { item: StoryItem; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const { url, openLightbox } = useLove();
  const src = url(item.path);
  useGsap(ref, (gsap) => {
    const st = { trigger: ref.current, start: "top 85%", end: "center 55%", scrub: 0.7 };
    gsap.fromTo(".sb-main", { xPercent: 70, rotate: 22, opacity: 0 }, { xPercent: 0, rotate: -3, opacity: 1, ease: "power2.out", scrollTrigger: st });
    gsap.fromTo(".sb-back", { xPercent: -50, rotate: -20, opacity: 0 }, { xPercent: 0, rotate: 9, opacity: 0.85, ease: "power2.out", scrollTrigger: st });
    gsap.fromTo(".sb-doodle path", { strokeDashoffset: 400 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 60%", end: "center 40%", scrub: 0.5 } });
  }, [src]);
  return (
    <SceneShell tone="linear-gradient(180deg, var(--noir) 0%, oklch(0.2 0.07 20) 50%, var(--noir) 100%)">
      <section ref={ref} className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center gap-14 md:flex-row md:justify-center">
        <div className="relative h-[min(110vw,520px)] w-[min(86vw,420px)]">
          <div className="sb-back absolute top-6 left-2 w-[78%] bg-paper p-2 pb-10 polaroid-shadow">
            <div className="aspect-[3/4] overflow-hidden bg-noir">{src && <img src={src} alt="" className="h-full w-full scale-125 object-cover opacity-70 blur-[2px]" loading="lazy" />}</div>
          </div>
          <button onClick={() => src && openLightbox(src, item.title)} className="sb-main absolute top-14 right-0 w-[80%] bg-cream p-2.5 pb-12 polaroid-shadow" aria-label={`Open photo: ${item.title}`}>
            <span aria-hidden className="absolute -top-3 -right-4 h-7 w-20 rotate-[35deg] bg-rose-gold/70" />
            <div className="relative aspect-[3/4] overflow-hidden bg-noir">
              {src && <img src={src} alt={item.title} className="h-full w-full object-cover" loading="lazy" />}
              <ZoomHint />
            </div>
            <span className="absolute inset-x-0 bottom-2 text-center font-hand text-2xl text-ink">us, always</span>
          </button>
          <svg className="sb-doodle pointer-events-none absolute -bottom-6 -left-4 h-28 w-40 text-blush" viewBox="0 0 160 110" fill="none" aria-hidden>
            <path d="M20 90 C 40 40, 80 40, 110 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="400" />
            <path d="M100 58 L112 72 L96 76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="400" />
            <path d="M130 30 C 124 18, 108 22, 116 36 L 130 50 L 144 36 C 152 22, 136 18, 130 30 Z" stroke="var(--cherry-glow)" strokeWidth="2.5" strokeDasharray="400" />
          </svg>
        </div>
        <SceneText n={n} kind="Scrapbook" title={item.title} caption={item.caption} align="left" />
      </section>
    </SceneShell>
  );
}

/* Scene: curtain reveal with giant drifting title */
function Curtain({ item, n }: { item: StoryItem; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const { url, openLightbox } = useLove();
  const src = url(item.path);
  useGsap(ref, (gsap) => {
    gsap.fromTo(".cu-frame", { clipPath: "inset(0% 50% 0% 50% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "power2.inOut", scrollTrigger: { trigger: ref.current, start: "top 75%", end: "center 55%", scrub: 0.6 } });
    gsap.fromTo(".cu-img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    gsap.fromTo(".cu-giant", { xPercent: 10 }, { xPercent: -40, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.4 } });
  }, [src]);
  return (
    <SceneShell tone="radial-gradient(80% 60% at 50% 50%, oklch(0.24 0.09 25) 0%, var(--noir) 80%)">
      <section ref={ref} className="relative z-[1] flex w-full flex-col items-center gap-12">
        <p aria-hidden className="cu-giant pointer-events-none absolute top-1/3 left-0 whitespace-nowrap font-script text-[28vw] leading-none text-cream/[0.06] md:text-[16vw]">
          {item.title} · {item.title}
        </p>
        <button onClick={() => src && openLightbox(src, item.title)} className="cu-frame relative aspect-[3/4] w-[min(84vw,420px)] overflow-hidden rounded-3xl gold-border p-1" aria-label={`Open photo: ${item.title}`}>
          <div className="relative h-full w-full overflow-hidden rounded-[1.3rem]">{src && <img src={src} alt={item.title} className="cu-img h-full w-full object-cover" loading="lazy" />}</div>
          <ZoomHint />
        </button>
        <SceneText n={n} kind="Photograph" title={item.title} caption={item.caption} />
      </section>
    </SceneShell>
  );
}

/* Scene: photo inside a glowing heart window */
function HeartWindow({ item, n }: { item: StoryItem; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const { url, openLightbox } = useLove();
  const src = url(item.path);
  useGsap(ref, (gsap) => {
    gsap.fromTo(".hw-mask", { scale: 0.45, rotate: -12, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: ref.current, start: "top 80%", end: "center 55%", scrub: 0.7 } });
    gsap.fromTo(".hw-img", { scale: 1.6 }, { scale: 1.05, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "center center", scrub: 0.6 } });
  }, [src]);
  return (
    <SceneShell tone="radial-gradient(60% 50% at 50% 45%, oklch(0.32 0.13 15) 0%, oklch(0.12 0.03 15) 75%)">
      <section ref={ref} className="relative z-[1] flex w-full flex-col items-center gap-10">
        <div className="relative">
          <HeartIcon className="absolute inset-[-8%] h-[116%] w-[116%] text-cherry-glow/30 blur-2xl animate-glow-pulse" />
          <button onClick={() => src && openLightbox(src, item.title)} className="hw-mask heart-mask relative block aspect-[100/92] w-[min(88vw,480px)] bg-noir" aria-label={`Open photo: ${item.title}`}>
            {src && <img src={src} alt={item.title} className="hw-img h-full w-full object-cover object-[50%_35%]" loading="lazy" />}
          </button>
        </div>
        <SceneText n={n} kind="Heart Frame" title={item.title} caption={item.caption} />
      </section>
    </SceneShell>
  );
}

function VideoScene({ item, n, reel, decor }: { item: StoryItem; n: number; reel: number; decor: "glow" | "film" | "tilt" }) {
  const ref = useRef<HTMLElement>(null);
  const { url } = useLove();
  useGsap(ref, (gsap) => {
    gsap
      .timeline({ scrollTrigger: { trigger: ref.current, start: "top 90%", end: "bottom 5%", scrub: 0.6 } })
      .fromTo(".vs-frame", { opacity: 0, y: 90, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1 })
      .to(".vs-frame", { opacity: 1, duration: 1.4 })
      .to(".vs-frame", { opacity: 0.15, y: -60, scale: 0.95, ease: "power1.in", duration: 1 });
  }, []);
  const tones = [
    "linear-gradient(180deg, var(--noir), oklch(0.2 0.08 18), var(--noir))",
    "radial-gradient(70% 60% at 30% 50%, oklch(0.25 0.1 10) 0%, var(--noir) 75%)",
    "radial-gradient(70% 60% at 70% 50%, oklch(0.24 0.08 30) 0%, var(--noir) 75%)",
  ];
  return (
    <SceneShell tone={tones[reel % tones.length] ?? tones[0]!}>
      <section ref={ref} className={`relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center gap-12 ${reel % 2 ? "md:flex-row-reverse" : "md:flex-row"} md:justify-center`}>
        <div className="vs-frame">
          <CinematicVideo src={url(item.path)} poster={url(item.poster)} title={item.title} reel={reel} decor={decor} />
        </div>
        <SceneText n={n} kind="Video" title={item.title} caption={item.caption} align="left" />
      </section>
    </SceneShell>
  );
}

const PHOTO_SCENES = [CinemaZoom, PolaroidFloat, Scrapbook, Curtain, HeartWindow];
const VIDEO_DECOR: ("glow" | "film" | "tilt")[] = ["glow", "film", "tilt", "glow", "film"];

export function MemoryStory() {
  const { content } = useLove();
  let p = 0;
  let v = 0;
  return (
    <div id="memories">
      <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-6 py-24 text-center bg-night">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ amount: 0.5 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          <p className="eyebrow">Our Memories · 5 photographs · 5 videos</p>
          <h2 className="mt-6 font-display text-3xl leading-snug text-cream italic md:text-5xl text-glow">{content.memoriesIntro}</h2>
          <div className="mx-auto mt-10 h-16 w-px bg-gradient-to-b from-rose-gold to-transparent" />
        </motion.div>
      </section>
      {content.story.map((item, i) => {
        if (item.kind === "photo") {
          const Scene = PHOTO_SCENES[p % PHOTO_SCENES.length] ?? CinemaZoom;
          p++;
          return <Scene key={item.id} item={item} n={i + 1} />;
        }
        const reel = ++v;
        return <VideoScene key={item.id} item={item} n={i + 1} reel={reel} decor={VIDEO_DECOR[(reel - 1) % VIDEO_DECOR.length] ?? "glow"} />;
      })}
    </div>
  );
}
