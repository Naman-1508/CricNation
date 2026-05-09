import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        
        // Mock validation for now, later check against DB/Redis
        if (credentials.otp === "123456") {
          return { id: "1", name: "Virat Sharma", phone: credentials.phone as string }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" }
})
