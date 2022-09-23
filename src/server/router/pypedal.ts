import assert from "assert";
import { z } from "zod";
import { t } from "./context";

import { EventEmitter } from "events";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { WebSocket } from "ws";
import { authorizedKedyProcedure } from "./procedures";

import {
  boardValidator,
  StatusResponse,
  youtubeVideoRegex,
  videoUrlValidator,
  serverResponseValidator,
  ServerRequest,
} from "../../utils/pypedal";

const DEBUG = process.env.NODE_ENV === "development";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();
const wss = new WebSocket(process.env.PEDAL_WEBSOCKET_URL || "/ws", {
  headers: {
    Authorization: process.env.PEDAL_WEBSOCKET_SECRET,
  },
});

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
  if (DEBUG) console.log("onServerStatusResponse <<", response);
  // update cache
  // ...
  // emit event
  ee.emit("pedal.status", response);
};

const sendServerRequest = (request: ServerRequest) => {
  if (DEBUG) console.log("sendServerRequest >>", request);
  wss.send(JSON.stringify(request));
};

const panicAwareProcedure = authorizedKedyProcedure.use(({ ctx, next }) => {
  if (wss.readyState !== WebSocket.OPEN) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Server is not ready",
    });
  }
  return next({ ctx });
});

export const pypedalRouter = t.router({
  status: panicAwareProcedure
    .input(
      z.object({
        url: videoUrlValidator,
        board_name: boardValidator,
      })
    )
    .subscription(({ input: { url, board_name } }) => {
      return observable<StatusResponse>((emit) => {
        const id = url.match(youtubeVideoRegex)?.[1];
        assert(id, "Invalid youtube video url");

        const cache = null;
        if (cache) {
          emit.next(cache);
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

        ee.on("pedal.status", (payload: StatusResponse) => {
          if (
            !(
              payload.url === id &&
              payload.board_name.toString() === board_name.toString()
            )
          )
            return;
          // should be sync with cache
          if (DEBUG) console.log("pedal.status", payload);
          emit.next(payload);
          // if (payload.state === "DONE") emit.complete();
        });
        return () => {
          ee.off("pedal.status", emit.next);
        };
      });
    }),
});
