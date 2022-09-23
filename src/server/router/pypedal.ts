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
  ServerRequest,
} from "../../utils/pypedal";
import { createNewWebSocket } from "../../utils/pypedalWebsockets";

const DEBUG = process.env.NODE_ENV === "development";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();
const wss = createNewWebSocket(ee);

// mapping of [id][board_name][board_type] -> status
// const boardLastStatusCache = ...;

export const onServerStatusResponse = (response: StatusResponse) => {
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
