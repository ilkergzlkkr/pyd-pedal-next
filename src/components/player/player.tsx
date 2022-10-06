import { useEffect, useState, createRef } from "react";
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
        <button className="flex btn btn-ghost" onClick={toggle}>
          {(player?.state || "no player").toString()}
        </button>
        <span className="label-text">Volume</span>
        <input
          id="steps-range"
          type="range"
          min="-50"
          max="1"
          value={player?.volume.value.toFixed() || 0}
          step="1"
          onChange={setVolume}
          className="range"
        />
        <span className="label-text">Slowed</span>
        <input
          className="range range-primary"
          type="range"
          min="0.7"
          max="1"
          value={player?.playbackRate || 1}
          step="0.01"
          onChange={setSlowed}
        />
        <div className="w-full flex justify-between text-xs px-2">
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
        </div>
        <ReverbMixer />
        <p>playbackRate {player?.playbackRate}x</p>
        <p>state {player?.state}</p>
        <p>context state {player?.context.state}</p>
        <p>duration {player?.buffer.duration}</p>
        <p>{currentTime?.toFixed()}</p>
        <p>{player?.context.listener.now().toFixed()}</p>
        <button
          disabled={!player?.state}
          className="btn btn-success mt-5"
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

  if (downloadYTVideo.isError)
    return (
      <div className="flex-1 input-group">
        <span>Failed to download video</span>
        <button
          className="btn btn-error"
          onClick={() => {
            downloadYTVideo.reset();
            setUrl("");
          }}
        >
          Reset
        </button>
      </div>
    );
  if (downloadYTVideo.isLoading)
    return (
      <div className="flex-1">
        <span>Downloading Youtube video</span>
        <progress className="progress bg-current w-56"></progress>
      </div>
    );

  return (
    <>
      <form className="mr-5">
        <div className="input-group input-group-vertical">
          <span className="label-text">Upload file</span>
          <input
            className="block w-full text-sm bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
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
            className="btn btn-secondary mt-5"
            onClick={(e) => {
              e.preventDefault();
              onFileChange();
            }}
          >
            load from file
          </button>
        </div>
        <div className="p-7"></div>
        <div className="input-group">
          <input
            disabled={!downloadYTVideo.isIdle}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Youtube url"
            className="input input-bordered font-bold input-secondary w-full max-w-xs placeholder:font-extrabold"
          />
          <button
            disabled={!url || !downloadYTVideo.isIdle}
            className="btn btn-secondary"
            onClick={async (e) => {
              e.preventDefault();
              console.log("downloadYTVideo", url);
              downloadYTVideo.mutate(url);
            }}
          >
            load from youtube
          </button>
        </div>
      </form>
    </>
  );
};

export const ReverbMixer = () => {
  const { reverb, setReverb } = usePlayerStore();
  if (!reverb)
    return (
      <label className="block mb-2 text-sm font-medium dark:text-gray-300">
        Reverb - Disabled
      </label>
    );
  return (
    <>
      <div className="p-5"></div>
      <span className="label-text">Reverb</span>

      <div>
        <div>
          <span className="label-text">Decay {reverb.decay.toString()}</span>
          <input
            id="steps-range"
            type="range"
            min="1"
            max="5"
            step="0.05"
            value={reverb.decay.toString() || 1}
            onChange={(e) => setReverb({ decay: e.target.value })}
            className="range range-secondary"
          />
        </div>
        <div>
          <span className="label-text">
            Pre Delay {reverb.preDelay.toString()}
          </span>
          <input
            id="steps-range"
            type="range"
            min="0"
            max="0.3"
            step="0.01"
            value={reverb.preDelay.toString() || 0.1}
            onChange={(e) => setReverb({ preDelay: e.target.value })}
            className="range range-secondary"
          />
        </div>
        <div>
          <span className="label-text">Wet {reverb.wet.value}</span>
          <input
            id="steps-range"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={reverb.wet.value || 0.1}
            onChange={(e) => setReverb({ wet: e.target.value })}
            className="range range-secondary"
          />
        </div>
      </div>
    </>
  );
};
