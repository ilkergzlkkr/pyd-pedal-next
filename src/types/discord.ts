import { z } from "zod";

export const discordGuildValidator = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  owner: z.boolean(),
  permissions: z.number(),
});

export type DiscordGuild = z.infer<typeof discordGuildValidator>;
