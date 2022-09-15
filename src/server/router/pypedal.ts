import { createRouter } from "./context";
import { z } from "zod";

import { EventEmitter } from "events";
import { Subscription, TRPCError } from "@trpc/server";

import { WebSocket } from "ws";

import {
  boardValidator,
  StatusResponse,
  youtubeVideoRegex,
  videoUrlValidator,
  serverResponseValidator,
  ServerRequest,
} from "../../utils/pypedal";
import assert from "assert";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();
const wss = new WebSocket(process.env.PEDAL_WEBSOCKET_URL || "/ws", {
  headers: {
    Authorization: process.env.PEDAL_WEBSOCKET_SECRET,
  },
});
const wsStatus = new Map<number, string>([
  [WebSocket.CONNECTING, "CONNECTING"],
  [WebSocket.OPEN, "OPEN"],
  [WebSocket.CLOSING, "CLOSING"],
  [WebSocket.CLOSED, "CLOSED"],
]);
wss.onerror = (event) => {
  console.log("wss.onerror", event);
};

wss.onmessage = (event) => {
  if (typeof event.data !== "string") {
    console.error("Received non-string data");
    return;
  }

  const payload = JSON.parse(event.data.toString());
  // safe parse data from server
  const parsed = serverResponseValidator.safeParse(payload);
  if (!parsed.success) {
    console.error("Invalid data from server", parsed.error);
    return;
  }

  const { op, data } = parsed.data;
  if (op === "STATUS") {
    onServerStatusResponse(data);
  } else if (op === "INTERNAL_ERROR") {
    // code 2 -> validation error
    console.error("Server error", data);
    if (data.disconnected) wss.close(undefined, data.message);
  }
};
// mapping of [id][board_name][board_type] -> status
// const boardLastStatusCache = ...;

const onServerStatusResponse = (response: StatusResponse) => {
  // update cache
  // ...
  // emit event
  ee.emit("pedal.status", response);
};

const sendServerRequest = (request: ServerRequest) => {
  console.log("sendServerRequest", request);
  wss.send(JSON.stringify(request));
};

export const pypedalRouter = createRouter()
  .query("status", {
    async resolve({ ctx }) {
      if (ctx.session)
        return {
          status: "ok",
          serverStatus: wsStatus.get(wss.readyState) || "UNKNOWN",
        };
      throw new TRPCError({ code: "UNAUTHORIZED" });
    },
  })
  .mutation("create", {
    input: z.object({
      url: videoUrlValidator,
      board_name: boardValidator,
    }),
    async resolve({ ctx, input: { url, board_name } }) {
      if (!ctx.session || !ctx.session.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      if (wss.readyState !== WebSocket.OPEN) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Websocket is not open",
        });
      }

      const id = url.match(youtubeVideoRegex)?.[1];
      assert(id, "Invalid youtube video url");
      // const [boardName, board_type] = board_name;

      // const cache = boardLastStatusCache.get({
      //   id,
      //   board_name: boardName,
      //   board_type,
      // });
      // if (cache /* && cache.state === "DONE" */) {
      //   return cache;
      // }

      sendServerRequest({
        op: "INIT",
        data: {
          url,
          board_name,
        },
      });
      ee.emit("pedal.created", id, board_name);
    },
  })
  .subscription("status", {
    input: z.object({
      url: videoUrlValidator,
      board_name: boardValidator,
    }),
    async resolve({ ctx, input: { url, board_name } }) {
      return new Subscription<StatusResponse>((emit) => {
        if (!ctx.session || !ctx.session.user)
          throw new TRPCError({ code: "UNAUTHORIZED" });
        if (wss.readyState !== WebSocket.OPEN) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Websocket is not open",
          });
        }

        const id = url.match(youtubeVideoRegex)?.[1];
        assert(id, "Invalid youtube video url");
        // const [boardName, board_type] = board_name;
        const cache = null;

        // const cache = boardLastStatusCache.get({
        //   id,
        //   board_name: boardName,
        //   board_type,
        // });
        if (cache /* && cache.state === "DONE" */) {
          emit.data(cache);
        } else {
          // send request to server
          sendServerRequest({
            op: "INIT",
            data: {
              url: id,
              board_name,
            },
          });
        }

        ee.on("pedal.status", (payload) => {
          // const cache = boardLastStatusCache.get({
          //   id,
          //   board_name: boardName,
          //   board_type,
          // });
          // assert(cache);
          // emit.data(cache);
          console.log("pedal.status", payload);
          emit.data(payload);
        });
        return () => {
          ee.off("pedal.status", emit.data);
        };
      });
    },
  });
