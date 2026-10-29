import { lexoUdhetimet } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

// Vetëm të dhënat publike të udhëtimit. Asnjë profil, email ose sesion.
// Shoferi dhe ora e mëparshme shfaqen edhe te lista publike, ndaj kartat offline duken njësoj.
export async function GET() {
  try {
    const rows = await lexoUdhetimet();
    const trips = rows.map(({ id, shoferi, nisja, destinacioni, ora, ora_e_meparshme, vendtakimi, vende }) =>
      ({ id, shoferi, nisja, destinacioni, ora, ora_e_meparshme, vendtakimi, vende }));
    return Response.json({ trips }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Lista nuk mund të lexohet tani." }, { status: 503 });
  }
}
