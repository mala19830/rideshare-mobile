import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lexoNjoftimet } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.githubId) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    return Response.json({ notifications: await lexoNjoftimet(session.user.githubId) }, { headers });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
