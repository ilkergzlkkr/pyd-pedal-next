import { useEffect, useState, createRef, useCallback } from "react";
import { usePlayerStore } from "./store";
import { useDownloadYTVideo, usePlayerCurrentTimeQuery } from "./utils";

export interface MusicPlayerProps {
  any?: any;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = () => {
  const { player, downloading, toggle, setVolume, setSlowed, download } =
    usePlayerStore();

  useEffect(() => {
    // player?.context.resume();
    return () => {
      console.log("player-effect-unload", player);
      // player?.context.dispose();
    };
  }, [player]);

  const { data: currentTime } = usePlayerCurrentTimeQuery();
  if (typeof window === "undefined") return null;
  if (downloading) return <div>Downloading...</div>;
  return (
    <>
      <div>
        <button onClick={toggle}>
          {(player?.state || "no player").toString()}
        </button>
        <label
          htmlFor="steps-range"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Volume
        </label>
        <input
          id="steps-range"
          type="range"
          min="-50"
          max="1"
          value={player?.volume.value.toFixed() || 0}
          step="1"
          onChange={setVolume}
          className="w-full h-5 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />

        <label
          htmlFor="steps-range"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Slowed
        </label>
        <input
          id="steps-range"
          type="range"
          min="0.7"
          max="1"
          value={player?.playbackRate || 1}
          step="0.01"
          onChange={setSlowed}
          className="w-full h-3 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <ReverbMixer />
        <p>playbackRate {player?.playbackRate}x</p>
        <p>state {player?.state}</p>
        <p>context state {player?.context.state}</p>
        <p>duration {player?.buffer.duration}</p>
        <p>{currentTime?.toFixed()}</p>
        <p>{player?.context.listener.now().toFixed()}</p>
        <button
          disabled={!player?.state}
          className="block p-2 m-2 bg-green-500 rounded-xl font-extrabold text-slate-300 shadow-xl border-4 border-slate-800 disabled:opacity-50"
          onClick={async () => download()}
        >
          download
        </button>
      </div>
    </>
  );
};

export const InputEmbedForPlayer = () => {
  const [url, setUrl] = useState("");
  const { setSrc } = usePlayerStore();
  const audioInputRef = createRef<HTMLInputElement>();
  const downloadYTVideo = useDownloadYTVideo();

  const onFileChange = () => {
    console.log("onFileChange", audioInputRef.current?.files);
    const file = audioInputRef.current?.files?.item(0);
    if (!file) return;
    const src = URL.createObjectURL(file);
    setSrc(src);
  };

  useEffect(() => {
    if (downloadYTVideo.isError) setUrl("error");
    if (!downloadYTVideo.isSuccess) return;
    const { res, src } = downloadYTVideo.data;
    console.log(
      "title, thumb",
      res.headers.get("x-yt-title"),
      res.headers.get("x-yt-thumb")
    );
    setSrc(src);
  }, [downloadYTVideo.isSuccess, downloadYTVideo.isError]);

  if (downloadYTVideo.isError) return <div>yt download error</div>;
  if (downloadYTVideo.isLoading) return <div>yt audio downloading</div>;

  return (
    <>
      <form className="mr-5">
        <label
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          htmlFor="file_input"
        >
          Upload file
        </label>
        <input
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          type="file"
          accept="audio/*"
          ref={audioInputRef}
        />
        <p
          className="mt-1 text-sm text-gray-500 dark:text-gray-300"
          id="file_input_help"
        >
          Any sound file (MAX. 300MB).
        </p>
        <button
          id="file_load_action"
          className="p-2 m-2 bg-indigo-500 rounded-xl font-extrabold text-slate-300 shadow-xl border-4 border-slate-800 disabled:opacity-50"
          onClick={(e) => {
            e.preventDefault();
            onFileChange();
          }}
        >
          load from file
        </button>
        <div className="p-5"></div>
        <input
          disabled={!downloadYTVideo.isIdle}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Youtube url"
          className="container mb-8 py-1 p-5 text-black font-boldborder border-indigo-800 rounded-sm disabled:opacity-50 placeholder:font-extrabold"
        />
        <button
          disabled={!url || !downloadYTVideo.isIdle}
          className="p-2 m-2 bg-indigo-500 rounded-xl font-extrabold text-slate-300 shadow-xl border-4 border-slate-800 disabled:opacity-50"
          onClick={async (e) => {
            e.preventDefault();
            console.log("downloadYTVideo", url);
            downloadYTVideo.mutate(url);
          }}
        >
          load from youtube
        </button>
      </form>
    </>
  );
};

export const ReverbMixer = () => {
  const { reverb } = usePlayerStore();
  if (!reverb)
    return (
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        Reverb - Disabled
      </label>
    );
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        Reverb
      </label>
      <div>
        <div>
          <label className="m-1 text-xs font-medium text-gray-900 dark:text-gray-300">
            decay
          </label>
          <input
            id="steps-range"
            type="range"
            min="1"
            max="5"
            step="0.01"
            value={reverb.decay.toString() || 1}
            onChange={(e) => (reverb.decay = parseFloat(e.target.value))}
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          {reverb.decay.toString()}
        </div>
        <div>
          <label className="m-1 text-xs font-medium text-gray-900 dark:text-gray-300">
            pre delay
          </label>
          <input
            id="steps-range"
            type="range"
            min="0"
            max="0.3"
            step="0.01"
            value={reverb.preDelay.toString() || 0.1}
            onChange={(e) => (reverb.preDelay = parseFloat(e.target.value))}
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          {reverb.preDelay.toString()}
        </div>
        <div>
          <label className="m-1 text-xs font-medium text-gray-900 dark:text-gray-300">
            wet
          </label>
          <input
            id="steps-range"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={reverb.wet.value || 0.1}
            onChange={(e) => (reverb.wet.value = parseFloat(e.target.value))}
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          {reverb.wet.value}
        </div>
      </div>
    </>
  );
};
