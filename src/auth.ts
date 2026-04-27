import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectDb from "./lib/db";
import { User } from "./models/user.model";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          await connectDb();
          const user = await User.findOne({ email }).select("+password").lean();
          if (!user || !user.password) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role, 
          };
        } catch (error) {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
  if (account?.provider === "google") {
    try {
      await connectDb();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "user",
        });

        user.id = newUser._id.toString();
        user.role = newUser.role;
      } else {
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
      }
    } catch (error) {
      return false;
    }
  }

  return true;
},
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);