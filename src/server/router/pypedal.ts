import { t } from "./context";

// import { TRPCError } from "@trpc/server";
import { authorizedKedyProcedure } from "./procedures";

// const panicAwareProcedure = authorizedKedyProcedure.use(({ ctx, next }) => {
//   if (wss.readyState !== WebSocket.OPEN) {
//     throw new TRPCError({
//       code: "PRECONDITION_FAILED",
//       message: "Server is not ready",
//     });
//   }
//   return next({ ctx });
// });

export const pypedalRouter = t.router({
  isAuthorized: authorizedKedyProcedure.query(() => {
    return true;
  }),
});
