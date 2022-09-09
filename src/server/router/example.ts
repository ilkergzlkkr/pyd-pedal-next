import { createRouter } from "./context";
import { z } from "zod";
import { Example } from "@prisma/client";

import { EventEmitter } from "events";
import { Subscription } from "@trpc/server";
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
  })
  .subscription("subscribeToAll", {
    async resolve({ ctx }) {
      return new Subscription<Example>((emit) => {
        const onAdd = (data: Example) => {
          // emit data to client
          emit.data(data);
        };
        // trigger `onAdd()` when `add` is triggered in our event emitter
        ee.on("example.created", onAdd);
        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          ee.off("example.created", onAdd);
        };
      });
    },
  });
