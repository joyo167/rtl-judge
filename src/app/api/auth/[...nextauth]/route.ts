import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { NextRequest } from "next/server"

const authOptions = {
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
}

function handler(req: NextRequest, res: any) {
  return NextAuth(req, res, authOptions)
}

export { handler as GET, handler as POST }
