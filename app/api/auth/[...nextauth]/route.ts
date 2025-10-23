import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { dbConnect } from "@/lib/db";
import UserModel, { type UserDoc } from "@/lib/models/User";
import bcrypt from "bcryptjs";

type DBUser = UserDoc & { _id: any; password?: string }; // legacy fallback

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise, { databaseName: "freakthetix" }),
  session: { strategy: "jwt" },
  debug: true,

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // DB connect with proper try/catch
        try {
          await dbConnect();
        } catch (e: any) {
          console.error("DB_CONNECT_FAIL:", e?.message);
          // return null => 401 (CredentialsSignin) दिखेगा
          // throw new Error("DB_CONNECT_FAIL"); // चाहें तो 500 देने के लिए use करें
          return null;
        }

        // user lookup
        const email = String(credentials.email).toLowerCase().trim();
        const user = await UserModel.findOne({ email }).lean<DBUser | null>();
        if (!user) {
          console.warn("LOGIN_FAIL: user-not-found", email);
          return null;
        }

        // passwordHash (new) or password (legacy) fallback
        const hash = user.passwordHash ?? user.password;
        if (!hash) {
          console.warn("LOGIN_FAIL: no-password-hash-on-user", user._id);
          return null;
        }

        const ok = await bcrypt.compare(String(credentials.password), hash);
        if (!ok) {
          console.warn("LOGIN_FAIL: bad-password", user._id);
          return null;
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name || "",
          role: user.role || "user",
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };
