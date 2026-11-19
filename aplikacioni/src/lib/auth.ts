import "server-only";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;
const secret = process.env.NEXTAUTH_SECRET;
export const hyrjaAktive = Boolean(clientId && clientSecret && secret);

// GitHub verifikon identitetin. Rolin e lexojmë veçmas nga Neon.
export const authOptions: NextAuthOptions = {
  secret,
  providers: clientId && clientSecret && secret ? [GitHubProvider({ clientId, clientSecret })] : [],
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

export async function lexoSesionin() {
  return hyrjaAktive ? getServerSession(authOptions) : null;
}

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
