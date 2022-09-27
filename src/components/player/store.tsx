import create from "zustand";
import * as Tone from "tone";
import toWav from "audiobuffer-to-wav";

interface PlayerStore {
  player?: Tone.Player;
  src?: string;
  downloading: boolean;
  setSrc: (src: string) => void;
  toggle: () => void;
  setVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSlowed: (e: React.ChangeEvent<HTMLInputElement>) => void;
  download: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  downloading: false,
  async setSrc(src) {
    const player =
      get().player ||
      new Tone.Player({
        loop: true,
        onerror: console.error,
        onload: console.log,
      }).toDestination();
    player.debug = true;
    await player.load(src);
    player.volume.value = -25;
    (globalThis as any).Tone = Tone;
    (globalThis as any).player = player;
    set({ src, player });
  },
  async toggle() {
    const player = get().player;
    if (!player) return console.log("not loaded");
    if (player.state == "started") {
      player.stop();
    } else if (player.state == "stopped") {
      player.start();
    }
    set({ player });
  },
  async setVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const player = get().player;
    if (!player) return;
    const volume = parseFloat(e.target.value);
    player.volume.rampTo(volume || -25, 0.1);
    set({ player });
  },
  async setSlowed(e: React.ChangeEvent<HTMLInputElement>) {
    const player = get().player;
    if (!player) return;
    const slowed = parseFloat(e.target.value);
    player.playbackRate = slowed || 1;
    set({ player });
  },
  async download() {
    const player = get().player;
    if (!player?.state) return;
    const outputDuration =
      player.buffer.duration * (2.01 - player.playbackRate);
    const outputBuffer = await Tone.Offline(async () => {
      set({ downloading: true });
      const reverb = new Tone.Reverb({
        decay: 0.5,
        preDelay: 0.01,
      }).toDestination();
      const clonePlayer = new Tone.Player(player.buffer).connect(reverb);
      clonePlayer.playbackRate = player.playbackRate;
      await Tone.loaded();
      clonePlayer.start();
    }, outputDuration);
    const wav = toWav(outputBuffer as unknown as AudioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    const new_file = URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = new_file;
    tempLink.download = "filename";
    tempLink.style.display = "none";
    tempLink.click();
    set({ downloading: false });
  },
}));