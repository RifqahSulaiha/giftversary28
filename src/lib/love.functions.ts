import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";
import { gateSessionConfig, passwordMatches, type GateSession } from "./gate.server";
import { DEFAULT_CONTENT, mergeContent } from "./content-defaults.server";
import { collectMediaPaths, type LoveContent, type SignedUrls } from "./content-types";

const BUCKET = "memories";
const SIGN_SECONDS = 60 * 60 * 8;

async function isUnlocked() {
  const session = await useSession<GateSession>(gateSessionConfig());
  return session.data.unlocked === true;
}

async function requireUnlocked() {
  if (!(await isUnlocked())) throw redirect({ to: "/" });
}

async function signPaths(paths: string[]): Promise<SignedUrls> {
  if (paths.length === 0) return {};
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, SIGN_SECONDS);
  if (error) throw new Error("Could not prepare your memories");
  const out: SignedUrls = {};
  const serverBase = (process.env["SUPABASE_URL"] ?? "").replace(/\/+$/, "");
  const publicBase = (import.meta.env["VITE_SUPABASE_URL"] ?? "").replace(/\/+$/, "");
  for (const row of data ?? []) {
    if (!row.path || !row.signedUrl) continue;
    let url = row.signedUrl;
    if (serverBase && publicBase && url.startsWith(serverBase)) url = publicBase + url.slice(serverBase.length);
    out[row.path] = url;
  }
  return out;
}

export const getGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { unlocked: await isUnlocked() };
});

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("The secret password has not been set up yet");
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await useSession<GateSession>(gateSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(gateSessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const getLoveContent = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_content").select("data").eq("id", "main").maybeSingle();
  const content = mergeContent(data?.data);
  const urls = await signPaths(collectMediaPaths(content));
  return { content, urls };
});

const path = z.string().min(1).max(300).regex(/^[A-Za-z0-9._\-/]+$/);
const short = z.string().max(400);
const long = z.string().max(8000);

const contentSchema = z.object({
  opening: z.object({ greeting: short, subtitle: short, button: short }),
  memoriesIntro: short,
  story: z
    .array(
      z.object({
        id: z.string().max(40),
        kind: z.enum(["photo", "video"]),
        path,
        poster: path.nullable(),
        title: short,
        caption: z.string().max(1200),
      }),
    )
    .length(10),
  questions: z.object({
    q1: short, q1Yes: short, q1No: short, q1YesReply: short, q1NoReply: short,
    q2: short, q2A: short, q2B: short, q2AReply: short, q2BReply: short,
  }),
  quiz: z
    .array(z.object({ question: short, options: z.array(short).min(2).max(6), answer: z.number().int().min(0).max(5) }))
    .min(1)
    .max(30),
  puzzle: z.object({ code: z.string().min(1).max(40), hints: z.array(short).max(10), secretLetter: long }),
  reasons: z.array(short).min(1).max(150),
  timeline: z
    .array(z.object({ id: z.string().max(40), date: short, title: short, description: z.string().max(2000), photo: path.nullable() }))
    .max(40),
  letter: z.object({ teaser: short, greeting: short, body: long, signoff: short }),
  finale: z.object({ date: short, line1: short, line2: short, final: short, photo: path }),
});

export const saveLoveContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contentSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ id: "main", data: data as unknown as never, updated_at: new Date().toISOString() });
    if (error) throw new Error("Could not save your changes");
    const content = data as LoveContent;
    const urls = await signPaths(collectMediaPaths(content));
    return { content, urls };
  });

export const resetLoveContent = createServerFn({ method: "POST" }).handler(async () => {
  await requireUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("site_content").delete().eq("id", "main");
  const urls = await signPaths(collectMediaPaths(DEFAULT_CONTENT));
  return { content: DEFAULT_CONTENT, urls };
});

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export const createMediaUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ contentType: z.string().max(80) }).parse(data))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const ext = ALLOWED[data.contentType];
    if (!ext) throw new Error("Please choose a photo (JPG, PNG, WEBP) or a video (MP4, WEBM, MOV)");
    const objectPath = `uploads/${crypto.randomUUID()}.${ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(objectPath);
    if (error || !signed) throw new Error("Could not start the upload");
    return { path: objectPath, token: signed.token };
  });

export const signMedia = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ paths: z.array(path).max(60) }).parse(data))
  .handler(async ({ data }) => {
    await requireUnlocked();
    return signPaths(data.paths);
  });
