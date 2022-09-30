/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { setGuilds } from "../../../utils/discord";
// import { env } from "../../../env/server.mjs";
// due to mjs import issues, im using process.env instead

function isDiscord(
  profile: DiscordProfile | unknown
): profile is DiscordProfile {
  // idk typescript, but seems that there is no interface checking
  return (<DiscordProfile>profile).accent_color !== undefined;
}

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      return baseUrl + "/pypedal";
    },

    async signIn({ account, user }) {
      if (!user.id) return false;
      try {
        await setGuilds(user.id, account);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
  },

  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
