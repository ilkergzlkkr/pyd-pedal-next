import { createRouter } from "./context";
import { z } from "zod";

import { EventEmitter } from "events";
// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

export const exampleRouter = createRouter()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.example.findMany();
    },
  })
  .mutation("create", {
    input: z.object({
      id: z.string().cuid(),
    }),
    async resolve({ ctx, input: { id } }) {
      const result = await ctx.prisma.example.create({
        data: {
          id,
        },
      });

      ee.emit("example.created", result);
      return result;
    },
  });
