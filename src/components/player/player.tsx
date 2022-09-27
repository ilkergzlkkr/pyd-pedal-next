import { useEffect, useState, createRef } from "react";
import { usePlayerStore } from "./store";

export const MusicPlayer = () => {
  const { player, downloading, toggle, setVolume, setSlowed, download } =
    usePlayerStore();

  useEffect(() => {
    // player?.context.resume();
    return () => {
      console.log("player-effect-unload", player);
      // player?.context.dispose();
    };
  }, [player]);

  if (typeof window === "undefined") return null;
  if (downloading) return <div>Downloading...</div>;
  return (
    <div>
      <button onClick={toggle}>
        {(player?.state || "no player").toString()}
      </button>
      <input
        type="text"
        placeholder="volume"
        onBlur={setVolume}
        onSubmit={setVolume}
        className="w-20 text-black"
      />
      <input
        type="text"
        placeholder="slowed"
        onBlur={setSlowed}
        onSubmit={setSlowed}
        className="w-20 text-black"
      />
      <p>playbackRate {player?.playbackRate}</p>
      <p>state {player?.state}</p>
      <p>context state {player?.context.state}</p>
      <p>duration {player?.buffer.duration}</p>
      <p>{player?.context.rawContext.currentTime}</p>
      <button onClick={async () => download()}>download</button>
    </div>
  );
};

export const InputEmbedForPlayer = () => {
  const store = usePlayerStore();
  const audioInputRef = createRef<HTMLInputElement>();
  const onFileChange = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    console.log("onFileChange", audioInputRef.current?.files);
    const file = audioInputRef.current?.files?.item(0);
    if (!file) return;

    const src = URL.createObjectURL(file);
    store.setSrc(src);
  };
  return (
    <>
      <form className="grid mr-5" onSubmit={onFileChange}>
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
          onClick={(e) => {
            e.preventDefault();
            onFileChange();
          }}
        >
          Load
        </button>
      </form>
    </>
  );
};
