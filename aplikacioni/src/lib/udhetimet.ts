import "server-only";
import { getSql } from "./db";

export type Udhetim = {
  id: string;
  shoferi: string;
  nisja: string;
  destinacioni: string;
  ora: string;
  ora_e_meparshme: string | null;
  vendtakimi: string;
  vende: number;
};

// Të dhëna fiktive në Neon; aplikacioni vetëm i lexon.
export async function lexoUdhetimet(): Promise<Udhetim[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, COALESCE(to_jsonb(u)->>'shoferi', 'Ende i pacaktuar') AS shoferi,
      nisja, destinacioni, ora, to_jsonb(u)->>'ora_e_meparshme' AS ora_e_meparshme, vendtakimi, vende
    FROM udhetimet u ORDER BY id
  `;
  return rows as Udhetim[];
}

export async function gjejUdhetimin(id: string): Promise<Udhetim | undefined> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, COALESCE(to_jsonb(u)->>'shoferi', 'Ende i pacaktuar') AS shoferi,
      nisja, destinacioni, ora, to_jsonb(u)->>'ora_e_meparshme' AS ora_e_meparshme, vendtakimi, vende
    FROM udhetimet u WHERE id = ${id}
  `;
  return rows[0] as Udhetim | undefined;
}
