import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { shenoNjoftiminLexuar } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.githubId) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "not_found" }, { status: 404, headers });
  try {
    const updated = await shenoNjoftiminLexuar(id, session.user.githubId);
    if (!updated) return Response.json({ error: "not_found" }, { status: 404, headers });
    return Response.json({ read: true }, { headers });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
