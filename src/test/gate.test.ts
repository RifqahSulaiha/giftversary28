import { describe, expect, it } from "vitest";
import { passwordMatches } from "@/lib/gate.server";
import { codeMatches } from "@/lib/content-types";

describe("secret password", () => {
  it("unlocks with the exact lowercase password", () => {
    expect(passwordMatches("meow", "meow")).toBe(true);
  });
  it("rejects capitalised versions", () => {
    expect(passwordMatches("Meow", "meow")).toBe(false);
    expect(passwordMatches("MEOW", "meow")).toBe(false);
  });
  it("rejects extra spaces or other words", () => {
    expect(passwordMatches(" meow", "meow")).toBe(false);
    expect(passwordMatches("meow ", "meow")).toBe(false);
    expect(passwordMatches("", "meow")).toBe(false);
  });
});

describe("unlock my heart puzzle", () => {
  it("accepts 28-11-2026 in any separator style", () => {
    expect(codeMatches("28-11-2026", "28112026")).toBe(true);
    expect(codeMatches("28/11/2026", "28-11-2026")).toBe(true);
  });
  it("rejects a wrong date", () => {
    expect(codeMatches("27-11-2026", "28112026")).toBe(false);
  });
});
