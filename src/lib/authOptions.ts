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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[signIn] provider:", account?.provider, "profile keys:", profile ? Object.keys(profile) : null)
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as { id: number; login: string }
        try {
          const saved = await prisma.user.upsert({
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
          console.log("[signIn] upsert OK, user id:", saved.id)
        } catch (e) {
          console.error("[signIn] PRISMA UPSERT FAILED:", e)
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      // On initial sign-in, persist the GitHub id and our DB user id.
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as { id: number }
        const githubId = String(githubProfile.id)
        token.githubId = githubId
        try {
          const dbUser = await prisma.user.findUnique({
            where: { githubId },
            select: { id: true, username: true },
          })
          if (dbUser) {
            token.dbUserId = dbUser.id
            token.username = dbUser.username
          }
        } catch (e) {
          console.error("[jwt] PRISMA LOOKUP FAILED:", e)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; githubId?: string; username?: string }
        u.id = token.dbUserId as string | undefined
        u.githubId = token.githubId as string | undefined
        u.username = token.username as string | undefined
      }
      return session
    },
  },
}
