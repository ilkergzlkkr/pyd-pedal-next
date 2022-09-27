import React from "react";
import dynamic from "next/dynamic";
import { usePlayerStore } from "./store";
import { MusicPlayer, InputEmbedForPlayer } from "./player";

const LazyPlayer = dynamic(
  () => import("./player").then((module) => module.MusicPlayer),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

export { LazyPlayer, usePlayerStore, MusicPlayer, InputEmbedForPlayer };
