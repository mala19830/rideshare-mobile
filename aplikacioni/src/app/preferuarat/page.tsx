import Link from "next/link";
import { profiliIm } from "@/lib/lejet";
import { getSql } from "@/lib/db";
import type { Udhetim } from "@/lib/udhetimet";
import { ListaPreferuarave } from "@/components/ListaPreferuarave";

export const dynamic = "force-dynamic";

export default async function Preferuarat() {
  let udhetimet: Udhetim[];
  try {
    const profili = await profiliIm();
    if (!profili) {
      return <main>
        <Link className="back" href="/">Kthehu te udhëtimet</Link>
        <h1>Udhëtimet e mia favorite</h1>
        <p className="lead">Hyr në llogarinë tënde për t’i parë udhëtimet e ruajtura.</p>
        <Link className="action" href="/panel">Hyr në llogari</Link>
      </main>;
    }
    const sql = getSql();
    const rows = await sql`
      SELECT u.id, u.shoferi, u.nisja, u.destinacioni, u.ora, u.ora_e_meparshme, u.vendtakimi, u.vende
      FROM preferimet p
      JOIN udhetimet u ON u.id = p.udhetim_id
      WHERE p.github_id = ${profili.id}
      ORDER BY p.krijuar_me DESC, u.id
    `;
    udhetimet = rows as Udhetim[];
  } catch {
    return <main>
      <h1>Udhëtimet e mia favorite</h1>
      <p role="alert">Nuk mundëm t’i ngarkonim udhëtimet favorite. Provo përsëri më vonë.</p>
      <Link className="back" href="/">Kthehu te udhëtimet</Link>
    </main>;
  }

  return <main>
    <Link className="back" href="/">Kthehu te udhëtimet</Link>
    <h1>Udhëtimet e mia favorite</h1>
    {udhetimet.length === 0 ? <p>Nuk ke ruajtur ende asnjë udhëtim si favorit.</p> :
      <ListaPreferuarave udhetimet={udhetimet} />}
  </main>;
}
