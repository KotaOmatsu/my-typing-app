import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: (() => {
        if (!process.env.GITHUB_ID) {
          throw new Error("GITHUB_ID is not set");
        }
        return process.env.GITHUB_ID;
      })(),
      clientSecret: (() => {
        if (!process.env.GITHUB_SECRET) {
          throw new Error("GITHUB_SECRET is not set");
        }
        return process.env.GITHUB_SECRET;
      })(),
    }),
    GoogleProvider({
      clientId: (() => {
        if (!process.env.GOOGLE_CLIENT_ID) {
          throw new Error("GOOGLE_CLIENT_ID is not set");
        }
        return process.env.GOOGLE_CLIENT_ID;
      })(),
      clientSecret: (() => {
        if (!process.env.GOOGLE_CLIENT_SECRET) {
          throw new Error("GOOGLE_CLIENT_SECRET is not set");
        }
        return process.env.GOOGLE_CLIENT_SECRET;
      })(),
    }),
  ],
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
