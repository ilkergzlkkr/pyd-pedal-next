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

  if (req.method !== "POST") return res.status(400).end();
  try {
    const url = req.body.url;

    res.setHeader("content-type", "audio/mpeg");
    const stream = ytdl(url, {
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
