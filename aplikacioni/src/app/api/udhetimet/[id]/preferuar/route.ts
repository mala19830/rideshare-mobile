import { profiliIm } from "@/lib/lejet";
import { getSql } from "@/lib/db";
import { ruajPreferim } from "@/lib/preferimet";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rezultati = await ruajPreferim(id);
    if (rezultati === "hyr") return Response.json({ error: "Hyr para se të ruash udhëtimin." }, { status: 401 });
    if (rezultati === "ruajtur") return Response.json({ saved: true });
    return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404 });
  } catch {
    return Response.json({ error: "Preferimi nuk mund të ruhet tani." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profili = await profiliIm();
    if (!profili) {
      return Response.json({ error: "Hyr para se të heqësh udhëtimin nga të preferuarat." }, { status: 401 });
    }
    const { id } = await params;
    const sql = getSql();
    await sql`
      DELETE FROM preferimet
      WHERE github_id = ${profili.id} AND udhetim_id = ${id}
    `;
    return Response.json({ saved: false });
  } catch {
    return Response.json({ error: "Preferimi nuk mund të hiqet tani." }, { status: 503 });
  }
}
