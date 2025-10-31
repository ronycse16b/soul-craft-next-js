import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./lib/db.config";
import User from "./models/user.model";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        await connectDB();

        const { name, email, picture, sub } = profile;

        const user = await User.findOneAndUpdate(
          { googleId: sub }, // search filter
          {
            name,
            emailOrPhone: email,
            image: picture,
            googleId: sub,
            isGoogle: true,
          }, // update data
          { new: true, upsert: true } // return updated doc or create if not exist
        );

        return {
          id: user._id.toString(),
          name: user.name,
          emailOrPhone: user.emailOrPhone,
          image: user.image,
          googleId: user.googleId,
          address: user.address,
          role: user.role,
          isGoogle: user.isGoogle,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const { emailOrPhone, password } = credentials;

        const user = await User.findOne({ emailOrPhone: emailOrPhone });

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          emailOrPhone: user.emailOrPhone,
          image: user.image,
          address: user.address,
          role: user.role,
          isGoogle: user.isGoogle,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
    updateAge: 60 * 60,
  },

  jwt: {
    maxAge: 60 * 60 * 12,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isGoogle = user.isGoogle;
        token.image = user.image || null;
        token.name = user.name || null;
        token.emailOrPhone = user.emailOrPhone || null;
        token.address = user.address || null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.isGoogle = token.isGoogle;
      session.user.emailOrPhone = token.emailOrPhone;
      session.user.name = token.name;
      session.user.address = token.address;
      session.user.image = token.image;
      return session;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },
  trustHost: true,
});
