import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      } else if (!token.id && token.email) {
        // Fallback for older sessions that don't have token.id
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
        if (dbUser) token.id = dbUser.id
      }
      return token
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    }
  }
})
