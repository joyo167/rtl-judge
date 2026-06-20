import GithubProvider from "next-auth/providers/github"
import type { NextAuthOptions } from "next-auth"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as { id: number; login: string }
        await prisma.user.upsert({
          where: { githubId: String(githubProfile.id) },
          update: {
            username: githubProfile.login ?? user.name ?? "",
            name: user.name ?? null,
            email: user.email ?? null,
            avatarUrl: user.image ?? null,
          },
          create: {
            githubId: String(githubProfile.id),
            username: githubProfile.login ?? user.name ?? "",
            name: user.name ?? null,
            email: user.email ?? null,
            avatarUrl: user.image ?? null,
          },
        })
      }
      return true
    },
    async session({ session, token }) {
      return session
    },
  },
}
