import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LoveContent, SignedUrls } from "@/lib/content-types";

type Ctx = {
  content: LoveContent;
  urls: SignedUrls;
  setLive: (content: LoveContent, urls: SignedUrls) => void;
  addUrls: (urls: SignedUrls) => void;
  url: (path: string | null | undefined) => string | undefined;
  openLightbox: (src: string, alt: string) => void;
  lightbox: { src: string; alt: string } | null;
  closeLightbox: () => void;
};

const LoveCtx = createContext<Ctx | null>(null);

export function LoveProvider({ initial, children }: { initial: { content: LoveContent; urls: SignedUrls }; children: ReactNode }) {
  const [content, setContent] = useState(initial.content);
  const [urls, setUrls] = useState(initial.urls);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const value = useMemo<Ctx>(
    () => ({
      content,
      urls,
      setLive: (c, u) => {
        setContent(c);
        setUrls((prev) => ({ ...prev, ...u }));
      },
      addUrls: (u) => setUrls((prev) => ({ ...prev, ...u })),
      url: (p) => (p ? urls[p] : undefined),
      openLightbox: (src, alt) => setLightbox({ src, alt }),
      lightbox,
      closeLightbox: () => setLightbox(null),
    }),
    [content, urls, lightbox],
  );
  return <LoveCtx.Provider value={value}>{children}</LoveCtx.Provider>;
}

export function useLove() {
  const ctx = useContext(LoveCtx);
  if (!ctx) throw new Error("useLove must be used inside LoveProvider");
  return ctx;
}
