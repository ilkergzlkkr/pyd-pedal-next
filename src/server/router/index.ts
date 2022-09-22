// src/server/router/index.ts
import { t } from "./context";
import { exampleRouter } from "./example";
import { pypedalRouter } from "./pypedal";

export const appRouter = t.router({
  example: exampleRouter,
  pypedal: pypedalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
