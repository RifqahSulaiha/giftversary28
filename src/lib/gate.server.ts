import { createHash, timingSafeEqual } from "node:crypto";

/** Exact, case-sensitive, timing-safe password comparison. */
export function passwordMatches(input: string, expected: string): boolean {
  if (typeof input !== "string" || typeof expected !== "string" || expected.length === 0) return false;
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export type GateSession = { unlocked?: boolean };

export function gateSessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("SESSION_SECRET is not set");
  return {
    password,
    name: "little-world",
    // No maxAge: the cookie lasts for the current browser visit only.
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      partitioned: true,
      path: "/",
    },
  };
}
