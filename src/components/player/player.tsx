import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, createRef, useCallback } from "react";
import { usePlayerStore } from "./store";

export const MusicPlayer = () => {
  const {
    player,
    reverb,
    downloading,
    toggle,
    setVolume,
    setSlowed,
    download,
  } = usePlayerStore();

  useEffect(() => {
    // player?.context.resume();
    return () => {
      console.log("player-effect-unload", player);
      // player?.context.dispose();
    };
  }, [player]);

  const { data: currentTime } = useQuery(
    ["player", "currentTime"],
    () => player?.context.currentTime || 0,
    {
      refetchInterval: 1000,
    }
  );
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
        <label
          htmlFor="steps-range"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Reverb
        </label>
        <div>
          <input
            id="steps-range"
            type="range"
            min="1"
            max="5"
            value={reverb?.decay.toString() || 1}
            step="0.01"
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input
            id="steps-range"
            type="range"
            min="0.1"
            max="5"
            value={reverb?.preDelay.toString() || 0.1}
            step="0.01"
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input
            id="steps-range"
            type="range"
            min="0"
            max="1"
            value={reverb?.wet.toString() || 0.1}
            step="0.1"
            className="h-2 bg-gray-200 form-range rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
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
  const onFileChange = () => {
    console.log("onFileChange", audioInputRef.current?.files);
    const file = audioInputRef.current?.files?.item(0);
    if (!file) return;

    const src = URL.createObjectURL(file);
    setSrc(src);
  };
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
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="url"
          className="container mb-8 text-black font-bold py-1 p-5 border border-indigo-800 rounded-sm disabled:opacity-50"
        />
        <button
          disabled={!url}
          className="p-2 m-2 bg-indigo-500 rounded-xl font-extrabold text-slate-300 shadow-xl border-4 border-slate-800 disabled:opacity-50"
          onClick={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/yt", {
              method: "POST",
              headers: [["Content-Type", "application/json"]],
              body: JSON.stringify({ url }),
            });
            if (!res.ok) {
              setUrl("");
              return console.log("yt res not ok!");
            }
            const blob = await res.blob();
            const src = URL.createObjectURL(blob);
            setSrc(src);
          }}
        >
          load from youtube
        </button>
      </form>
    </>
  );
};
