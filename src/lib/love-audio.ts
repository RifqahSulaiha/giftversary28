// Soft, generated romantic instrumental (music-box + warm pad) and gentle UI sounds.
// Everything is created lazily after a user gesture, so nothing plays on its own.

type Listener = () => void;
export type AudioState = { playing: boolean; muted: boolean; ducked: boolean };
export type Sfx = "click" | "pop" | "chime" | "wrong" | "win" | "unlock";

const CHORDS: number[][] = [
  // Fmaj7, Em7, Dm7, Cmaj7 / Am7, Fmaj7, G6, Cmaj7  (MIDI notes)
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
  [45, 48, 52, 55],
  [53, 57, 60, 64],
  [55, 59, 62, 64],
  [48, 52, 55, 59],
];
const MELODY: (number | null)[] = [
  76, null, 74, 72, 74, null, 76, null,
  74, null, 72, 71, 72, null, 67, null,
  72, null, 69, 72, 74, null, 72, null,
  71, null, 67, 69, 71, null, 72, null,
  72, null, 76, 79, 76, null, 74, null,
  72, null, 69, 72, 77, null, 76, null,
  74, null, 71, 74, 76, null, 74, 72,
  72, null, null, null, 67, null, 72, null,
];

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

class LoveAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private sfxBus!: GainNode;
  private reverb!: ConvolverNode;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private listeners = new Set<Listener>();
  state: AudioState = { playing: false, muted: false, ducked: false };

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };
  getState = () => this.state;
  private emit(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.state.muted ? 0 : 1;
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.35;
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(ctx, 3.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    this.music.connect(this.master);
    this.music.connect(this.reverb);
    this.sfxBus.connect(this.master);
    this.sfxBus.connect(this.reverb);
    this.reverb.connect(wet).connect(this.master);
    return ctx;
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  private musicBox(freq: number, t: number, vel = 0.16) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 2.2);
    [1, 2.01, 3.98].forEach((h, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * h;
      const hg = ctx.createGain();
      hg.gain.value = [1, 0.28, 0.08][i] ?? 0;
      o.connect(hg).connect(g);
      o.start(t);
      o.stop(t + 2.3);
    });
    g.connect(this.music);
  }

  private pad(freqs: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0, t + dur + 0.6);
    freqs.forEach((f) => {
      [-4, 4].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = f;
        o.detune.value = det;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur + 0.7);
      });
    });
    lp.connect(g).connect(this.music);
  }

  private scheduler = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    const eighth = 60 / 70 / 2;
    while (this.nextTime < ctx.currentTime + 0.4) {
      const t = this.nextTime;
      const bar = Math.floor(this.step / 8) % CHORDS.length;
      const inBar = this.step % 8;
      const chord = CHORDS[bar] ?? CHORDS[0]!;
      if (inBar === 0) {
        this.pad(chord.map(midi), t, eighth * 8);
        this.musicBox(midi((chord[0] ?? 48) - 12), t, 0.1);
      }
      const arp = [0, 1, 2, 3, 2, 1, 2, 3][inBar] ?? 0;
      this.musicBox(midi((chord[arp] ?? 60) + 12), t, 0.05);
      const mel = MELODY[this.step % MELODY.length];
      if (mel != null) this.musicBox(midi(mel), t, 0.13);
      this.nextTime += eighth;
      this.step++;
    }
  };

  private applyMusicLevel() {
    if (!this.ctx) return;
    const target = this.state.playing ? (this.state.ducked ? 0.12 : 0.9) : 0;
    this.music.gain.cancelScheduledValues(this.ctx.currentTime);
    this.music.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  play() {
    const ctx = this.ensure();
    void ctx.resume();
    if (this.timer == null) {
      this.nextTime = ctx.currentTime + 0.1;
      this.timer = window.setInterval(this.scheduler, 100);
    }
    this.emit({ playing: true });
    this.applyMusicLevel();
  }

  pause() {
    this.emit({ playing: false });
    this.applyMusicLevel();
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (!this.state.playing && this.timer != null) {
        window.clearInterval(this.timer);
        this.timer = null;
        void ctx?.suspend();
      }
    }, 1500);
  }

  toggle() {
    if (this.state.playing) this.pause();
    else this.play();
  }

  setMuted(muted: boolean) {
    this.emit({ muted });
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
  }

  /** Lower the music while a video plays with sound, so it never fights the video audio. */
  setDucked(ducked: boolean) {
    if (this.state.ducked === ducked) return;
    this.emit({ ducked });
    this.applyMusicLevel();
  }

  sfx(kind: Sfx) {
    if (this.state.muted) return;
    const ctx = this.ensure();
    void ctx.resume();
    const t = ctx.currentTime + 0.01;
    const tone = (freq: number, at: number, dur: number, type: OscillatorType = "sine", vol = 0.5) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, at);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, at + dur);
      o.connect(g).connect(this.sfxBus);
      o.start(at);
      o.stop(at + dur + 0.05);
      return o;
    };
    switch (kind) {
      case "click":
        tone(880, t, 0.12, "sine", 0.3);
        break;
      case "pop": {
        const o = tone(520, t, 0.16, "sine", 0.55);
        o.frequency.exponentialRampToValueAtTime(1100, t + 0.1);
        break;
      }
      case "chime":
        [72, 76, 79].forEach((n, i) => tone(midi(n + 12), t + i * 0.07, 0.9, "sine", 0.3));
        break;
      case "wrong": {
        const o = tone(330, t, 0.35, "triangle", 0.35);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.3);
        break;
      }
      case "win":
        [72, 76, 79, 84, 88].forEach((n, i) => tone(midi(n), t + i * 0.09, 1.1, "sine", 0.3));
        break;
      case "unlock":
        [67, 72, 76, 79, 84].forEach((n, i) => tone(midi(n), t + i * 0.12, 1.4, "triangle", 0.22));
        break;
    }
  }
}

let instance: LoveAudio | null = null;
export function loveAudio(): LoveAudio {
  if (!instance) instance = new LoveAudio();
  return instance;
}
export function sfx(kind: Sfx) {
  if (typeof window === "undefined") return;
  loveAudio().sfx(kind);
}
