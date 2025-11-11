import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./lib/db.config";
import AddressBookModel from "./models/address.book.model";
import User from "./models/user.model";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    // ✅ Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        await connectDB();
        const { name, email, picture, sub } = profile;

        const user = await User.findOneAndUpdate(
          { googleId: sub },
          {
            $setOnInsert: {
              emailOrPhone: email,
              googleId: sub,
              isGoogle: true,
              hasPassword: false,
              role: "user",
              image: picture,
            },
            $set: { name },
          },
          { new: true, upsert: true }
        );

        // Create AddressBook if not exists
        const existingAddressBook = await AddressBookModel.findOne({
          userId: user._id,
        });
        if (!existingAddressBook) {
          await AddressBookModel.create({
            userId: user._id,
            addresses: [
              {
                name: user.name || "",
                deliveryAddress: "",
                phone: "",
                isDefault: false,
              },
            ],
          });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          emailOrPhone: user.emailOrPhone,
          image: user.image,
          googleId: user.googleId,
          role: user.role,
          isGoogle: user.isGoogle,
        };
      },
    }),

    // ✅ Credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const { emailOrPhone, password } = credentials;
        const user = await User.findOne({ emailOrPhone });
        if (!user) throw new Error("User not found");

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.name,
          emailOrPhone: user.emailOrPhone,
          image: user.image,
          role: user.role,
          isGoogle: user.isGoogle,
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  jwt: { maxAge: 60 * 60 * 12 },

  // // ✅ Correct cookie config for prod & dev
  // cookies: {
  //   sessionToken: {
  //     name: "__Secure-authjs.session-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NEXTAUTH_URL?.startsWith("https"),
  //     },
  //   },
  // },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id || token.sub;
      if (account?.provider === "google" && user) {
        const foundUser = await User.findOne({ googleId: user.googleId });
        if (foundUser) {
          token.id = foundUser._id.toString();
          token.sub = foundUser._id.toString();
          token.hasPassword = foundUser.hasPassword || false;
        }
      }
      token.role = user?.role || token.role;
      token.isGoogle = user?.isGoogle ?? token.isGoogle;
      token.image = user?.image || token.image || null;
      token.name = user?.name || token.name || null;
      token.emailOrPhone = user?.emailOrPhone || token.emailOrPhone || null;
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id || token.sub;
      session.user.role = token.role;
      session.user.isGoogle = token.isGoogle;
      session.user.emailOrPhone = token.emailOrPhone;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.hasPassword = token.hasPassword ?? false;
      return session;
    },
  },

  pages: { signIn: "/auth/sign-in" },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
});
