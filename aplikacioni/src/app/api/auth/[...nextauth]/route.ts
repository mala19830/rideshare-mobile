import NextAuth from "next-auth";
import { authOptions, hyrjaAktive } from "@/lib/auth";

const nextAuth = NextAuth(authOptions);

function handler(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!hyrjaAktive) {
    const endpoint = new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
    if (request.method === "GET" && (endpoint === "session" || endpoint === "providers")) {
      return Response.json({}, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ message: "Hyrja me GitHub është përkohësisht e padisponueshme." }, { status: 503 });
  }
  return nextAuth(request, context);
}

export { handler as GET, handler as POST };
