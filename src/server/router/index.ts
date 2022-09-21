// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { pypedalRouter } from "./pypedal";

import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const legacyRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .interop();

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

export const authenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    // in http: this will throw a 401 error when user is
    // not logged in but in reality, its UNAUTHORIZED idk why
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  }
  return next({
    ctx: { ...ctx, session: { ...ctx.session, user: ctx.session.user } },
  });
});

export const authorizedKedyProcedure = t.procedure
  .use(authenticatedMiddleware)
  .use(async ({ ctx, next }) => {
    if (
      !(await ctx.prisma.userGuild.findUnique({
        where: {
          id_userId: {
            id: "223090625224900608",
            userId: ctx.session.user.id,
          },
        },
      }))
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not special",
      });
    }
    return next({ ctx });
  });

const mainRouter = t.router({
  pypedal: pypedalRouter,
});

// Merges the v9 router with v10 router
export const appRouter = t.mergeRouters(legacyRouter, mainRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
