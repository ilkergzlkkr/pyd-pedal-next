import React from "react";
import dynamic from "next/dynamic";
import { usePlayerStore } from "./store";
import { MusicPlayer, InputEmbedForPlayer, MusicPlayerProps } from "./player";
import { PlayerNavigator } from "./navigator";
import { useDownloadYTVideo } from "./utils";

const LazyPlayer = dynamic<MusicPlayerProps>(
  () => import("./player").then((module) => module.MusicPlayer),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

export {
  LazyPlayer,
  usePlayerStore,
  MusicPlayer,
  InputEmbedForPlayer,
  PlayerNavigator,
  useDownloadYTVideo,
};
