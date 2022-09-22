import { z } from "zod";
import { t } from "./context";

export const exampleRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string().nullish() }))
    .query(({ input }) => {
      return `Hello ${input.text ?? "world"}`;
    }),
  getAll: t.procedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  create: t.procedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) => {
      return ctx.prisma.user.create({
        data: { id },
      });
    }),
});
