import { neon } from "@neondatabase/serverless";
import { appOrigin, audience, viewer } from "@/lib/auth";
import { parseCommand } from "@/lib/presence";
import { presenceStore } from "@/lib/store";

const headers = { "Cache-Control": "private, no-store" };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });

async function withMember(work: (member: { id: string; name: string }, store: ReturnType<typeof presenceStore>) => Promise<Response>) {
  try {
    const member = await viewer();
    if (!member) return reply({ error: "Hyr në llogari për të vazhduar." }, 401);
    if (!member.allowed) return reply({ error: "Llogaria nuk ka qasje në këtë grup." }, 403);
    const url = process.env.DATABASE_URL;
    if (!url) return reply({ error: "Databaza e grupit nuk është konfiguruar." }, 503);
    return await work(member, presenceStore(neon(url)));
  } catch {
    console.error("Klasa Live: kërkesa për praninë dështoi.");
    return reply({ error: "Shërbimi i vendndodhjes nuk përgjigjet. Provo përsëri." }, 503);
  }
}

export async function GET() {
  return withMember(async (_member, store) => reply({ people: await store.list(audience) }));
}

export async function POST(request: Request) {
  if (!appOrigin || request.headers.get("origin") !== appOrigin) {
    return reply({ error: "Burimi i kërkesës nuk lejohet." }, 403);
  }
  return withMember(async (member, store) => {
    const body: unknown = await request.json().catch(() => null);
    const command = parseCommand(body);
    if (!command) return reply({ error: "Të dhënat e vendndodhjes nuk janë të vlefshme." }, 400);
    if (!await store.write(member, command)) {
      return reply({ error: "Ndarja ka përfunduar. Aktivizoje përsëri." }, 409);
    }
    return reply({ ok: true });
  });
}
