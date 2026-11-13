import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, ImagePlus, Loader2, Plus, RotateCcw, Trash2, Video, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createMediaUpload, resetLoveContent, saveLoveContent, signMedia } from "@/lib/love.functions";
import { normalizeCode, type LoveContent } from "@/lib/content-types";
import { useLove } from "./LoveContext";

const TABS = ["Opening", "Memories", "Questions", "Quiz", "Puzzle", "Reasons", "Timeline", "Letter", "Finale"] as const;
type Tab = (typeof TABS)[number];

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";
const EXT_TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };

function fileType(f: File) {
  if (f.type) return f.type;
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TYPES[ext] ?? "";
}

/** Grabs a still frame from a video file to use as its cover image. */
function capturePoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    const src = URL.createObjectURL(file);
    let settled = false;
    const done = (b: Blob | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(src);
      resolve(b);
    };
    const timer = window.setTimeout(() => done(null), 10000);
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.addEventListener("loadeddata", () => {
      v.currentTime = Math.min(0.6, (v.duration || 1) / 2);
    }, { once: true });
    v.addEventListener("seeked", () => {
      try {
        const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight, 1));
        const c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * scale);
        c.height = Math.round(v.videoHeight * scale);
        c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((b) => {
          window.clearTimeout(timer);
          done(b);
        }, "image/jpeg", 0.86);
      } catch {
        done(null);
      }
    }, { once: true });
    v.addEventListener("error", () => done(null), { once: true });
    v.src = src;
  });
}

function useUploader() {
  const create = useServerFn(createMediaUpload);
  const sign = useServerFn(signMedia);
  const { addUrls } = useLove();
  return async (file: Blob, type: string) => {
    const { path, token } = await create({ data: { contentType: type } });
    const { error } = await supabase.storage.from("memories").uploadToSignedUrl(path, token, file, { contentType: type });
    if (error) throw new Error("The upload didn't go through. Please try again.");
    addUrls(await sign({ data: { paths: [path] } }));
    return path;
  };
}

function Field({ label, value, onChange, rows, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold tracking-wider text-rose-gold uppercase">{label}</span>
      {rows ? (
        <textarea className="field-love resize-y leading-relaxed" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="field-love" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl glass p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{title}</p>
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      {children}
    </div>
  );
}

const iconBtn = "grid h-8 w-8 place-items-center rounded-full text-blush hover:bg-cream/10 disabled:opacity-30";

function MediaSlot({
  kind,
  path,
  poster,
  onChange,
  onRemove,
}: {
  kind: "photo" | "video";
  path: string | null;
  poster?: string | null;
  onChange: (v: { path: string; poster?: string | null }) => void;
  onRemove?: () => void;
}) {
  const { url } = useLove();
  const upload = useUploader();
  const [busy, setBusy] = useState<string | null>(null);

  const pick = async (file: File | undefined, target: "main" | "poster") => {
    if (!file) return;
    const type = fileType(file);
    const wantVideo = kind === "video" && target === "main";
    if (wantVideo ? !type.startsWith("video/") : !type.startsWith("image/")) {
      toast.error(wantVideo ? "Please choose a video (MP4, WEBM or MOV)" : "Please choose a photo (JPG, PNG or WEBP)");
      return;
    }
    try {
      if (target === "poster") {
        setBusy("Uploading cover…");
        const p = await upload(file, type);
        onChange({ path: path ?? "", poster: p });
      } else if (wantVideo) {
        setBusy("Uploading video…");
        const posterBlob = await capturePoster(file);
        const p = await upload(file, type);
        let posterPath: string | null = null;
        if (posterBlob) {
          setBusy("Making a cover…");
          posterPath = await upload(posterBlob, "image/jpeg").catch(() => null);
        }
        onChange({ path: p, poster: posterPath });
      } else {
        setBusy("Uploading photo…");
        onChange({ path: await upload(file, type) });
      }
      toast.success("Uploaded! Remember to press Save 💗");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  const src = url(path);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-noir ring-1 ring-rose-gold/30">
        {src && kind === "photo" && <img src={src} alt="" className="h-full w-full object-cover" />}
        {src && kind === "video" && <video src={src} poster={url(poster)} muted playsInline preload="metadata" controls className="h-full w-full object-cover" />}
        {!src && <div className="grid h-full place-items-center text-xs text-muted-foreground">No {kind}</div>}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-noir/80 p-2 text-center text-xs text-cream">
            <Loader2 className="mb-1 h-5 w-5 animate-spin" />
            {busy}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="btn-ghost-love cursor-pointer">
          {kind === "video" ? <Video className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
          {path ? `Replace ${kind}` : `Add ${kind}`}
          <input type="file" className="sr-only" accept={kind === "video" ? VIDEO_ACCEPT : PHOTO_ACCEPT} disabled={!!busy} onChange={(e) => { void pick(e.target.files?.[0], "main"); e.target.value = ""; }} />
        </label>
        {kind === "video" && (
          <label className="btn-ghost-love cursor-pointer">
            <ImagePlus className="h-4 w-4" /> Change cover
            <input type="file" className="sr-only" accept={PHOTO_ACCEPT} disabled={!!busy} onChange={(e) => { void pick(e.target.files?.[0], "poster"); e.target.value = ""; }} />
          </label>
        )}
        {onRemove && path && (
          <button type="button" className="btn-ghost-love" onClick={onRemove}>
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

export function Editor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { content, url, setLive } = useLove();
  const save = useServerFn(saveLoveContent);
  const reset = useServerFn(resetLoveContent);
  const [tab, setTab] = useState<Tab>("Opening");
  const [draft, setDraft] = useState<LoveContent>(content);
  const [reasonsText, setReasonsText] = useState("");
  const [hintsText, setHintsText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(structuredClone(content));
    setReasonsText(content.reasons.join("\n"));
    setHintsText(content.puzzle.hints.join("\n"));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (fn: (d: LoveContent) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const onSave = async () => {
    const reasons = reasonsText.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 150);
    const hints = hintsText.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (reasons.length === 0) {
      toast.error("Please keep at least one reason 💕");
      return;
    }
    if (normalizeCode(draft.puzzle.code).length === 0) {
      toast.error("The secret code needs some numbers, like 28-11-2026");
      return;
    }
    for (const [i, q] of draft.quiz.entries()) {
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        toast.error(`Quiz question ${i + 1} has an empty box`);
        return;
      }
    }
    if (draft.story.some((s) => !s.path)) {
      toast.error("Every memory scene needs its photo or video");
      return;
    }
    setSaving(true);
    try {
      const res = await save({ data: { ...draft, reasons, puzzle: { ...draft.puzzle, hints } } });
      setLive(res.content, res.urls);
      toast.success("Saved! Your little world is updated 💗");
      onClose();
    } catch {
      toast.error("Couldn't save just now. Please check the texts aren't too long and try again.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!window.confirm("Put back all the original texts, photos and videos? Your edits will be lost.")) return;
    setSaving(true);
    try {
      const res = await reset();
      setLive(res.content, res.urls);
      toast.success("Everything is back to the original 💗");
      onClose();
    } catch {
      toast.error("Couldn't reset just now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const storyPhotos = draft.story.filter((s) => s.kind === "photo");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="editor"
          className="fixed inset-0 z-[88] flex flex-col bg-noir/97 backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          role="dialog"
          aria-label="Edit our little world"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-8">
            <div>
              <p className="eyebrow">Only for you</p>
              <h2 className="font-script text-3xl text-romance">Edit our little world</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-love px-5 py-3" onClick={onSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
              </button>
              <button className="grid h-11 w-11 place-items-center rounded-full glass text-cream" onClick={onClose} aria-label="Close without saving">
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
          <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3 md:px-8" aria-label="Sections">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${tab === t ? "bg-cherry text-cream" : "text-blush hover:bg-cream/10"}`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8">
            <div className="mx-auto max-w-3xl space-y-5 pb-24">
              {tab === "Opening" && (
                <Card title="Opening scene">
                  <Field label="Greeting" value={draft.opening.greeting} onChange={(v) => set((d) => void (d.opening.greeting = v))} />
                  <Field label="Line under it" value={draft.opening.subtitle} onChange={(v) => set((d) => void (d.opening.subtitle = v))} />
                  <Field label="Button" value={draft.opening.button} onChange={(v) => set((d) => void (d.opening.button = v))} />
                  <Field label="Memories intro" rows={3} value={draft.memoriesIntro} onChange={(v) => set((d) => void (d.memoriesIntro = v))} />
                </Card>
              )}

              {tab === "Memories" &&
                draft.story.map((s, i) => (
                  <Card key={s.id} title={`Scene ${i + 1} · ${s.kind === "photo" ? "Photograph" : "Video"}`}>
                    <MediaSlot
                      kind={s.kind}
                      path={s.path}
                      poster={s.poster}
                      onChange={({ path, poster }) =>
                        set((d) => {
                          const it = d.story[i]!;
                          if (path) it.path = path;
                          if (poster !== undefined) it.poster = poster;
                        })
                      }
                    />
                    <Field label="Title" value={s.title} onChange={(v) => set((d) => void (d.story[i]!.title = v))} />
                    <Field label="Caption" rows={3} value={s.caption} onChange={(v) => set((d) => void (d.story[i]!.caption = v))} />
                  </Card>
                ))}

              {tab === "Questions" && (
                <>
                  <Card title="Question 1">
                    <Field label="Question" value={draft.questions.q1} onChange={(v) => set((d) => void (d.questions.q1 = v))} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Yes button" value={draft.questions.q1Yes} onChange={(v) => set((d) => void (d.questions.q1Yes = v))} />
                      <Field label="No button" value={draft.questions.q1No} onChange={(v) => set((d) => void (d.questions.q1No = v))} />
                    </div>
                    <Field label="Reply to yes" rows={2} value={draft.questions.q1YesReply} onChange={(v) => set((d) => void (d.questions.q1YesReply = v))} />
                    <Field label="Reply to no" rows={2} value={draft.questions.q1NoReply} onChange={(v) => set((d) => void (d.questions.q1NoReply = v))} />
                  </Card>
                  <Card title="Question 2">
                    <Field label="Question" value={draft.questions.q2} onChange={(v) => set((d) => void (d.questions.q2 = v))} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First button" value={draft.questions.q2A} onChange={(v) => set((d) => void (d.questions.q2A = v))} />
                      <Field label="Second button" value={draft.questions.q2B} onChange={(v) => set((d) => void (d.questions.q2B = v))} />
                    </div>
                    <Field label="Reply to first" rows={2} value={draft.questions.q2AReply} onChange={(v) => set((d) => void (d.questions.q2AReply = v))} />
                    <Field label="Reply to second" rows={2} value={draft.questions.q2BReply} onChange={(v) => set((d) => void (d.questions.q2BReply = v))} />
                  </Card>
                </>
              )}

              {tab === "Quiz" && (
                <>
                  {draft.quiz.map((q, i) => (
                    <Card
                      key={i}
                      title={`Quiz question ${i + 1}`}
                      actions={
                        <button className={iconBtn} disabled={draft.quiz.length <= 1} onClick={() => set((d) => void d.quiz.splice(i, 1))} aria-label="Delete question">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      }
                    >
                      <Field label="Question" value={q.question} onChange={(v) => set((d) => void (d.quiz[i]!.question = v))} />
                      <div className="space-y-2">
                        <span className="block text-xs font-bold tracking-wider text-rose-gold uppercase">Answers · tick the correct one</span>
                        {q.options.map((o, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => set((d) => void (d.quiz[i]!.answer = j))}
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${q.answer === j ? "border-success bg-success/20 text-success" : "border-border text-muted-foreground"}`}
                              aria-label={`Mark answer ${j + 1} as correct`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <input className="field-love" value={o} onChange={(e) => set((d) => void (d.quiz[i]!.options[j] = e.target.value))} />
                            <button
                              className={iconBtn}
                              disabled={q.options.length <= 2}
                              onClick={() =>
                                set((d) => {
                                  const qq = d.quiz[i]!;
                                  qq.options.splice(j, 1);
                                  if (qq.answer >= qq.options.length) qq.answer = qq.options.length - 1;
                                  else if (qq.answer > j) qq.answer -= 1;
                                })
                              }
                              aria-label="Remove answer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {q.options.length < 6 && (
                          <button className="btn-ghost-love" onClick={() => set((d) => void d.quiz[i]!.options.push("New answer"))}>
                            <Plus className="h-4 w-4" /> Add answer
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                  {draft.quiz.length < 30 && (
                    <button className="btn-love" onClick={() => set((d) => void d.quiz.push({ question: "New question?", options: ["Answer 1", "Answer 2"], answer: 0 }))}>
                      <Plus className="h-4 w-4" /> Add question
                    </button>
                  )}
                </>
              )}

              {tab === "Puzzle" && (
                <Card title="Unlock my heart">
                  <Field label="Secret code" value={draft.puzzle.code} onChange={(v) => set((d) => void (d.puzzle.code = v))} hint="Only the numbers count, so 28-11-2026 and 28112026 are the same." />
                  <Field label="Hints (one per line)" rows={4} value={hintsText} onChange={setHintsText} />
                  <Field label="Secret letter" rows={6} value={draft.puzzle.secretLetter} onChange={(v) => set((d) => void (d.puzzle.secretLetter = v))} />
                </Card>
              )}

              {tab === "Reasons" && (
                <Card title={`Reasons · ${reasonsText.split("\n").filter((s) => s.trim()).length}`}>
                  <Field label="One reason per line" rows={22} value={reasonsText} onChange={setReasonsText} hint="Up to 150 reasons. The section title counts them for you." />
                </Card>
              )}

              {tab === "Timeline" && (
                <>
                  {draft.timeline.map((t, i) => (
                    <Card
                      key={t.id}
                      title={`Memory ${i + 1}`}
                      actions={
                        <>
                          <button className={iconBtn} disabled={i === 0} onClick={() => set((d) => void d.timeline.splice(i - 1, 0, d.timeline.splice(i, 1)[0]!))} aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button className={iconBtn} disabled={i === draft.timeline.length - 1} onClick={() => set((d) => void d.timeline.splice(i + 1, 0, d.timeline.splice(i, 1)[0]!))} aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button className={iconBtn} onClick={() => set((d) => void d.timeline.splice(i, 1))} aria-label="Delete memory">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      }
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Date" value={t.date} onChange={(v) => set((d) => void (d.timeline[i]!.date = v))} />
                        <Field label="Title" value={t.title} onChange={(v) => set((d) => void (d.timeline[i]!.title = v))} />
                      </div>
                      <Field label="Description" rows={3} value={t.description} onChange={(v) => set((d) => void (d.timeline[i]!.description = v))} />
                      <MediaSlot kind="photo" path={t.photo} onChange={({ path }) => set((d) => void (d.timeline[i]!.photo = path))} onRemove={() => set((d) => void (d.timeline[i]!.photo = null))} />
                    </Card>
                  ))}
                  {draft.timeline.length < 40 && (
                    <button
                      className="btn-love"
                      onClick={() => set((d) => void d.timeline.push({ id: `t${Date.now().toString(36)}`, date: "A special day", title: "New memory", description: "", photo: null }))}
                    >
                      <Plus className="h-4 w-4" /> Add memory
                    </button>
                  )}
                </>
              )}

              {tab === "Letter" && (
                <Card title="A letter from my heart">
                  <Field label="Line above the envelope" value={draft.letter.teaser} onChange={(v) => set((d) => void (d.letter.teaser = v))} />
                  <Field label="Greeting" value={draft.letter.greeting} onChange={(v) => set((d) => void (d.letter.greeting = v))} />
                  <Field label="Letter" rows={14} value={draft.letter.body} onChange={(v) => set((d) => void (d.letter.body = v))} hint="Leave an empty line between paragraphs." />
                  <Field label="Sign-off" value={draft.letter.signoff} onChange={(v) => set((d) => void (d.letter.signoff = v))} />
                </Card>
              )}

              {tab === "Finale" && (
                <Card title="Our forever">
                  <Field label="Date" value={draft.finale.date} onChange={(v) => set((d) => void (d.finale.date = v))} />
                  <Field label="First line" rows={2} value={draft.finale.line1} onChange={(v) => set((d) => void (d.finale.line1 = v))} />
                  <Field label="Second line" rows={2} value={draft.finale.line2} onChange={(v) => set((d) => void (d.finale.line2 = v))} />
                  <Field label="Final words" value={draft.finale.final} onChange={(v) => set((d) => void (d.finale.final = v))} />
                  <div>
                    <span className="mb-2 block text-xs font-bold tracking-wider text-rose-gold uppercase">Favourite photograph</span>
                    <div className="flex flex-wrap gap-2">
                      {storyPhotos.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => set((d) => void (d.finale.photo = p.path))}
                          className={`h-24 w-20 overflow-hidden rounded-lg ring-2 ${draft.finale.photo === p.path ? "ring-rose-gold" : "ring-transparent opacity-70"}`}
                          aria-label={`Use ${p.title}`}
                        >
                          {url(p.path) && <img src={url(p.path)} alt="" className="h-full w-full object-cover" />}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <MediaSlot kind="photo" path={draft.finale.photo} onChange={({ path }) => set((d) => void (d.finale.photo = path))} />
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex flex-wrap justify-between gap-3 pt-4">
                <button className="btn-ghost-love" onClick={onReset} disabled={saving}>
                  <RotateCcw className="h-4 w-4" /> Restore originals
                </button>
                <button className="btn-love" onClick={onSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
