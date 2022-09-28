import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";
import { appRouter } from "../../server/router";
import { createContext } from "../../server/router/context";

const yt = async (req: NextApiRequest, res: NextApiResponse) => {
  const context = await createContext({ req, res });
  const caller = appRouter.createCaller(context);
  try {
    await caller.pypedal.isAuthorized();
  } catch (e) {
    return res.status(403).end();
  }

  const { url } = JSON.parse(req.body);
  if (req.method !== "POST" || typeof url !== "string")
    return res.status(400).end();
  try {
    const info = await ytdl.getInfo(url);
    res.setHeader("x-yt-id", info.videoDetails.videoId);
    res.setHeader("x-yt-title", encodeURIComponent(info.videoDetails.title));
    res.setHeader("x-yt-thumb", info.videoDetails.thumbnails[0]?.url || "");
    res.setHeader("content-type", "audio/mpeg");
    const stream = ytdl.downloadFromInfo(info, {
      filter: "audioonly",
    });
    stream.on("finish", () => {
      res.end();
    });
    stream.on("error", (err) => {
      console.log("err: ", err);
      res.status(500).end();
    });
    stream.pipe(res);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).end();
  }
};

export default yt;
