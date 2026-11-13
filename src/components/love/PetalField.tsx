import { useEffect, useRef } from "react";

/** Slowly falling rose petals on a 2D canvas. Pauses when off-screen. */
export function PetalField({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    type P = { x: number; y: number; s: number; r: number; vr: number; vy: number; sway: number; ph: number; hue: number; flip: number };
    let petals: P[] = [];
    const spawn = (initial: boolean): P => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -30,
      s: 8 + Math.random() * 12,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      vy: 0.35 + Math.random() * 0.7,
      sway: 0.4 + Math.random() * 1.2,
      ph: Math.random() * Math.PI * 2,
      hue: Math.random(),
      flip: Math.random() * Math.PI * 2,
    });
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w < 640 ? 16 : 30) * density);
      petals = Array.from({ length: count }, () => spawn(true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    let raf = 0;
    let t = 0;
    const draw = (p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
      const g = ctx.createLinearGradient(-p.s, -p.s, p.s, p.s);
      const a = p.hue > 0.5 ? "rgba(214,40,70,0.9)" : "rgba(170,20,50,0.9)";
      g.addColorStop(0, "rgba(255,190,200,0.95)");
      g.addColorStop(0.55, a);
      g.addColorStop(1, "rgba(90,8,25,0.9)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.7, p.s * 0.8, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s * 0.9, -p.s * 0.7, 0, -p.s);
      ctx.fill();
      ctx.restore();
    };
    const tick = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i]!;
        p.y += p.vy;
        p.x += Math.sin(t * 0.01 + p.ph) * p.sway * 0.6;
        p.r += p.vr;
        p.flip += 0.02;
        if (p.y > h + 30) petals[i] = spawn(false);
        draw(p);
      }
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVis = () => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
