import { useSyncExternalStore } from "react";
import { Music, Pause, PenLine, Volume2, VolumeX } from "lucide-react";
import { loveAudio, type AudioState } from "@/lib/love-audio";

const SERVER_STATE: AudioState = { playing: false, muted: false, ducked: false };

export function MusicDock({ onEdit }: { onEdit: () => void }) {
  const audio = loveAudio();
  const st = useSyncExternalStore(audio.subscribe, audio.getState, () => SERVER_STATE);
  const btn = "grid h-10 w-10 place-items-center rounded-full text-cream transition hover:bg-cream/10";
  return (
    <div className="fixed top-3 right-3 z-[80] flex items-center gap-0.5 rounded-full glass p-1">
      <button onClick={() => audio.toggle()} className={btn} aria-label={st.playing ? "Pause music" : "Play music"} title={st.playing ? "Pause music" : "Play music"}>
        {st.playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Music className="h-4 w-4" />}
      </button>
      {st.playing && (
        <span aria-hidden className="mr-1 flex h-4 items-end gap-[2px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[3px] rounded-full bg-rose-gold" style={{ height: "100%", animation: `eq 0.9s ${i * 0.15}s ease-in-out infinite alternate`, opacity: st.muted ? 0.3 : 1 }} />
          ))}
        </span>
      )}
      <button onClick={() => audio.setMuted(!st.muted)} className={btn} aria-label={st.muted ? "Unmute sounds" : "Mute sounds"} title={st.muted ? "Unmute" : "Mute"}>
        {st.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button onClick={onEdit} className={btn} aria-label="Edit this little world" title="Edit">
        <PenLine className="h-4 w-4" />
      </button>
    </div>
  );
}
