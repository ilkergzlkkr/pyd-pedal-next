import { EventEmitter } from "events";
import { onServerStatusResponse } from "../server/router/pypedal";
import { serverResponseValidator } from "./pypedal";
import { WebSocket } from "ws";

export const createNewWebSocket = (
  ee: EventEmitter,
  setWebsocket: CallableFunction
) => {
  const wss = new WebSocket(process.env.PEDAL_WEBSOCKET_URL || "/ws", {
    headers: {
      Authorization: process.env.PEDAL_WEBSOCKET_SECRET || "",
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

  wss.onclose = async (_event) => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setWebsocket(createNewWebSocket(ee, setWebsocket));
  };

  return wss;
};
