import type { Account } from "next-auth";

import { prisma } from "../server/db/client";
import { discordGuildValidator } from "../types/discord";

export const setGuilds = async (id: string, account: Account) => {
  const guildRes = await (
    await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
      },
    })
  ).json();

  const parsed = discordGuildValidator.array().parse(guildRes);

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      guilds: {
        deleteMany: {},
        createMany: {
          data: parsed,
        },
      },
    },
  });
};
