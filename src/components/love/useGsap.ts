import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Runs a GSAP setup scoped to an element and reverts it on unmount. */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (g: typeof gsap, st: typeof ScrollTrigger) => void, deps: unknown[] = []) {
  useEffect(() => {
    if (!scope.current) return;
    const { gsap: g, ScrollTrigger: st } = ensureGsap();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = g.context(() => setup(g, st), scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
