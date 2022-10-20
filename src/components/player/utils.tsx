import { useMutation } from "@tanstack/react-query";
import { youtubeVideoRegex } from "../../utils/youtube";

export const useDownloadYTVideo = () => {
  return useMutation(["player", "downloadYTVideo"], async (query: string) => {
    const id = query.match(youtubeVideoRegex)?.[1];
    if (!id) throw new Error("Invalid youtube video query");
    const res = await fetch("/api/yt", {
      method: "POST",
      body: JSON.stringify({ url: query }),
    });
    if (!res.ok) throw new Error("Failed to download video");
    const blob = await res.blob();
    const src = URL.createObjectURL(blob);
    return { res, src };
  });
};
