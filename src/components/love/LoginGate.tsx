import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { unlockSite } from "@/lib/love.functions";
import { sfx } from "@/lib/love-audio";
import { FloatingHearts } from "./FloatingHearts";
import { CuteCat } from "./CuteCat";
import { HeartBurst } from "./HeartBurst";

export function LoginGate() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || success) return;
    setBusy(true);
    setError(null);
    try {
      const res = await unlock({ data: { password } });
      if (res.ok) {
        setSuccess(true);
        sfx("unlock");
        await new Promise((r) => setTimeout(r, 1100));
        await router.invalidate();
      } else {
        setError("Aiyooo! That's not the magic word! Try again, cutie! 🙈");
        setAttempt((a) => a + 1);
        sfx("wrong");
      }
    } catch {
      setError("The little world is waking up… please try once more 💗");
      setAttempt((a) => a + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-12 grain"
      style={{ background: "radial-gradient(100% 80% at 50% 0%, oklch(0.36 0.15 20) 0%, oklch(0.2 0.08 15) 45%, var(--noir) 100%)" }}
    >
      {/* cinematic light beams */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 h-[140%] w-40 rotate-[18deg] bg-gradient-to-b from-blush/15 to-transparent blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -top-40 right-1/4 h-[140%] w-32 -rotate-[14deg] bg-gradient-to-b from-rose-gold/10 to-transparent blur-3xl" />
      <FloatingHearts count={18} stars={34} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={success ? { opacity: 0, scale: 1.08, filter: "blur(10px)" } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: success ? 1 : 1.2, ease: [0.22, 1, 0.36, 1], delay: success ? 0.2 : 0 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <CuteCat />
        <h1 className="mt-2 font-script text-6xl leading-tight text-romance text-glow md:text-7xl">Hey, Stranger! 🐾</h1>
        <p className="mt-3 font-display text-xl text-cream/85 italic md:text-2xl">Only someone special can enter this little world...</p>

        <form onSubmit={onSubmit} className="relative mt-9 rounded-3xl glass p-5 md:p-7">
          <HeartBurst burstKey={success ? 1 : 0} count={26} spread={240} />
          <motion.div key={attempt} animate={attempt ? { x: [0, -12, 10, -6, 4, 0] } : {}} transition={{ duration: 0.45 }} className="relative">
            <label htmlFor="secret" className="sr-only">
              Secret password
            </label>
            <input
              id="secret"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter the secret password..."
              className="field-love h-14 pr-14 text-center text-lg tracking-wide"
              aria-invalid={!!error}
              aria-describedby={error ? "secret-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-blush hover:bg-cream/10"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                id="secret-error"
                key={attempt}
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm font-bold text-blush"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 font-display text-lg text-blush italic">
                Welcome home, my love… 💗
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-love mt-6 w-full" disabled={busy || success || password.length === 0}>
            {busy ? "Checking your heart…" : "UNLOCK MY HEART ❤️"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
