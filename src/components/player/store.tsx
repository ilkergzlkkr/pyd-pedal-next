import create from "zustand";
import * as Tone from "tone";
import toWav from "audiobuffer-to-wav";
import download from "downloadjs";

const defaults = {
  volume: -25,
  playbackRate: 0.85,
  decay: 1,
  wet: 0.5,
  preDelay: 0.1,
} as const;

interface PlayerStore {
  defaults: typeof defaults;
  player?: Tone.Player;
  src?: string;
  reverb?: Tone.Reverb;
  downloading: boolean;
  currentTime: number;
  setSrc: (src: string) => void;
  toggle: () => void;
  setVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSlowed: (e: React.ChangeEvent<HTMLInputElement>) => void;
  download: () => void;
  setCurrentTime: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  defaults,
  downloading: false,
  currentTime: 0,
  async setSrc(src) {
    const { decay, wet, preDelay, volume, playbackRate } = get().defaults;
    const reverb =
      get().reverb || new Tone.Reverb({ decay, wet, preDelay }).toDestination();
    const player =
      get().player ||
      new Tone.Player({
        playbackRate,
        volume,
        loop: true,
        onerror: console.error,
        onload: console.log,
      }).toDestination();
    reverb.debug = true;
    player.debug = true;
    player.connect(reverb);
    await player.load(src);
    (globalThis as any).Tone = Tone;
    (globalThis as any).player = player;
    (globalThis as any).reverb = reverb;
    set({ src, player, reverb, currentTime: 0 });
  },
  async toggle() {
    const player = get().player;
    if (!player) return console.log("not loaded");
    if (player.state == "started") {
      player.stop();
    } else if (player.state == "stopped") {
      player.start();
    }
    set({ player, currentTime: 0 });
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
    const { player, reverb, defaults } = get();
    if (!player?.state) return;
    const outputDuration =
      player.buffer.duration * (2.01 - player.playbackRate);
    const outputBuffer = await Tone.Offline(async () => {
      set({ downloading: true });
      const cloneReverb = new Tone.Reverb({
        decay: Number(reverb?.decay.toString()) || defaults.decay,
        preDelay: Number(reverb?.preDelay.toString()) || defaults.preDelay,
        wet: reverb?.wet.value || defaults.wet,
      }).toDestination();
      const clonePlayer = new Tone.Player(player.buffer).connect(cloneReverb);
      clonePlayer.playbackRate = player.playbackRate;
      await Tone.loaded();
      clonePlayer.start();
    }, outputDuration);
    const wav = toWav(outputBuffer as unknown as AudioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    download(blob, "output.wav", "audio/wav");
    set({ downloading: false });
  },
  setCurrentTime(time) {
    set({ currentTime: time });
  },
}));
