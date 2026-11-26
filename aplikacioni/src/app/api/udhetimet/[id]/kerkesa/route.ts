import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { krijoKerkesen, lexogjendjen, pranoKerkesen } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.githubId) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    const { id } = await params;
    const state = await lexogjendjen(id, session.user.githubId);
    if (!state) return Response.json({ error: "not_found" }, { status: 404, headers });
    return Response.json(state, { headers });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.githubId) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (body.action === "accept") {
      const requestId = Number(body.requestId);
      if (!Number.isSafeInteger(requestId) || requestId < 1) return Response.json({ error: "invalid" }, { status: 400, headers });
      const result = await pranoKerkesen(requestId, session.user.githubId);
      if (!result || result.outcome === "not_found") return Response.json({ error: "not_found" }, { status: 404, headers });
      if (result.outcome === "forbidden") return Response.json({ error: "forbidden" }, { status: 403, headers });
      if (result.outcome === "no_seats") return Response.json({ error: "no_seats" }, { status: 409, headers });
      return Response.json({ status: result.request_status, seats: result.seats_left, outcome: result.outcome }, { headers });
    }
    const result = await krijoKerkesen(id, session.user.githubId);
    if ("error" in result) return Response.json({ error: result.error }, { status: result.error === "not_found" ? 404 : 403, headers });
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
