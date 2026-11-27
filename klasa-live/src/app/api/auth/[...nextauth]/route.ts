import NextAuth from "next-auth";
import { authOptions, authReady } from "@/lib/auth";

const handler = NextAuth(authOptions);

async function auth(request: Request, context: unknown) {
  if (!authReady) return Response.json({ error: "Hyrja nuk është konfiguruar." }, { status: 503 });
  return handler(request, context);
}

export { auth as GET, auth as POST };
