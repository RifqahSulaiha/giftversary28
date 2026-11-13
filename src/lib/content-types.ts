// Shared (browser-safe) shapes for the editable anniversary content.
export type StoryItem = {
  id: string;
  kind: "photo" | "video";
  /** Private storage path of the photo or video */
  path: string;
  /** Optional poster image path for videos */
  poster: string | null;
  title: string;
  caption: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  photo: string | null;
};

export type LoveContent = {
  opening: { greeting: string; subtitle: string; button: string };
  memoriesIntro: string;
  story: StoryItem[];
  questions: {
    q1: string;
    q1Yes: string;
    q1No: string;
    q1YesReply: string;
    q1NoReply: string;
    q2: string;
    q2A: string;
    q2B: string;
    q2AReply: string;
    q2BReply: string;
  };
  quiz: QuizQuestion[];
  puzzle: { code: string; hints: string[]; secretLetter: string };
  reasons: string[];
  timeline: TimelineItem[];
  letter: { teaser: string; greeting: string; body: string; signoff: string };
  finale: { date: string; line1: string; line2: string; final: string; photo: string };
};

export type SignedUrls = Record<string, string>;

/** Keeps only digits so "28-11-2026", "28/11/2026" and "28112026" all compare equal. */
export function normalizeCode(code: string): string {
  return code.replace(/\D/g, "");
}

export function codeMatches(input: string, code: string): boolean {
  const a = normalizeCode(input);
  return a.length > 0 && a === normalizeCode(code);
}

/** Every private storage path referenced by the content (for signing URLs). */
export function collectMediaPaths(c: LoveContent): string[] {
  const set = new Set<string>();
  for (const s of c.story) {
    set.add(s.path);
    if (s.poster) set.add(s.poster);
  }
  for (const t of c.timeline) if (t.photo) set.add(t.photo);
  if (c.finale.photo) set.add(c.finale.photo);
  return [...set].filter(Boolean);
}
