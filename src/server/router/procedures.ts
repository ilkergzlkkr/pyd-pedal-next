import { TRPCError } from "@trpc/server";
import { t } from "./context";

export const publicProcedure = t.procedure;

export const authenticatedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    // in http: this will throw a 401 error when user is
    // not logged in but in reality, its UNAUTHORIZED idk why
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  }
  return next({
    ctx: { ...ctx, session: { ...ctx.session, user: ctx.session.user } },
  });
});

export const authorizedKedyProcedure = authenticatedProcedure.use(
  async ({ ctx, next }) => {
    const inKedyGuild = await ctx.prisma.userGuild.findUnique({
      where: {
        id_userId: {
          id: "223090625224900608",
          userId: ctx.session.user.id,
        },
      },
    });

    if (!inKedyGuild) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not special",
      });
    }
    return next({ ctx });
  }
);
