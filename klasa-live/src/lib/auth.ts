import "server-only";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

const {
  GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL,
  VERCEL_SIGN_IN_CLIENT_ID, VERCEL_SIGN_IN_CLIENT_SECRET, KLASA_VERCEL_TEAM_ID, KLASA_INVITE_CODE,
} = process.env;
const mode = process.env.AUTH_PROVIDER;
export const loginProvider = mode === "vercel" || mode === "class-code" ? mode : "github";
export const appOrigin = NEXTAUTH_URL && URL.canParse(NEXTAUTH_URL) ? new URL(NEXTAUTH_URL).origin : null;
const teamNamespace = loginProvider === "vercel" && KLASA_VERCEL_TEAM_ID && /^team_[a-z0-9]+$/i.test(KLASA_VERCEL_TEAM_ID)
  ? `vercel:${KLASA_VERCEL_TEAM_ID}:` : null;
const memberIds = (process.env.CLASS_MEMBER_IDS ?? "").split(",")
  .map((id) => id.trim()).filter((id) => /^[1-9]\d*$/.test(id));
const hashCode = (code: string) => createHash("sha256").update(code).digest();
const inviteHash = KLASA_INVITE_CODE && /^[\w-]{20,128}$/.test(KLASA_INVITE_CODE) ? hashCode(KLASA_INVITE_CODE) : null;
const inviteVersion = inviteHash?.toString("hex");
const prefix = loginProvider === "class-code" ? "class:" : teamNamespace;
export const audience = prefix ? { prefix } : memberIds;
export const groupReady = loginProvider === "class-code" ? Boolean(inviteHash)
  : loginProvider === "vercel" ? Boolean(teamNamespace) : memberIds.length > 0;

const providers: NextAuthOptions["providers"] = [];
if (loginProvider === "class-code") {
  if (inviteHash) {
    providers.push(Credentials({
      id: "class-code",
      name: "Kodi i klasës",
      credentials: { name: { label: "Emri", type: "text" }, code: { label: "Kodi i ftesës", type: "password" } },
      authorize(credentials) {
        const name = typeof credentials?.name === "string" ? credentials.name.trim().normalize("NFC") : "";
        const code = typeof credentials?.code === "string" ? credentials.code.trim() : "";
        if (!name || name.length > 60 || /[\u0000-\u001f\u007f]/.test(name) || !code || code.length > 128
          || !timingSafeEqual(inviteHash, hashCode(code))) return null;
        return { id: `class:${randomUUID()}`, name };
      },
    }));
  }
} else if (loginProvider === "vercel") {
  // Team access is enforced by Vercel Authentication on every deployment URL.
  if (teamNamespace && process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production"
    && appOrigin?.startsWith("https://") && VERCEL_SIGN_IN_CLIENT_ID && VERCEL_SIGN_IN_CLIENT_SECRET) {
    providers.push({
      id: "vercel",
      name: "Vercel",
      type: "oauth",
      wellKnown: "https://vercel.com/.well-known/openid-configuration",
      authorization: { params: { scope: "openid profile" } },
      checks: ["pkce", "state", "nonce"],
      idToken: true,
      client: { token_endpoint_auth_method: "client_secret_basic" },
      clientId: VERCEL_SIGN_IN_CLIENT_ID,
      clientSecret: VERCEL_SIGN_IN_CLIENT_SECRET,
      profile(profile: { sub: string; name?: string; preferred_username?: string }) {
        return { id: profile.sub, name: profile.name ?? profile.preferred_username };
      },
    });
  }
} else if (GITHUB_ID && GITHUB_SECRET) {
  providers.push(GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET }));
}

export const authReady = Boolean(NEXTAUTH_SECRET && appOrigin && providers.length);

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "github") token.githubId = account.providerAccountId;
      if (account?.provider === "vercel" && teamNamespace) token.vercelSubject = teamNamespace + account.providerAccountId;
      if (account?.provider === "class-code") {
        token.classId = account.providerAccountId;
        token.classVersion = inviteVersion;
      }
      return token;
    },
    async session({ session, token }) {
      const id = loginProvider === "class-code" && token.classVersion === inviteVersion ? token.classId
        : loginProvider === "vercel" ? token.vercelSubject
          : loginProvider === "github" ? token.githubId : undefined;
      if (session.user && typeof id === "string") session.user.id = id;
      return session;
    },
  },
};

export async function viewer() {
  const session = authReady ? await getServerSession(authOptions) : null;
  if (!session?.user?.id) return null;
  const { id, name } = session.user;
  const allowed = prefix ? id.startsWith(prefix) : memberIds.includes(id);
  return { id, name: name?.trim().slice(0, 100) || "Anëtar i klasës", allowed };
}

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id?: string };
  }
}
