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
    SELECT id, shoferi, nisja, destinacioni, ora, ora_e_meparshme, vendtakimi, vende
    FROM udhetimet ORDER BY id
  `;
  return rows as Udhetim[];
}

export async function gjejUdhetimin(id: string): Promise<Udhetim | undefined> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, shoferi, nisja, destinacioni, ora, ora_e_meparshme, vendtakimi, vende
    FROM udhetimet WHERE id = ${id}
  `;
  return rows[0] as Udhetim | undefined;
}

export function tekstiVendeve(vende: number) {
  if (vende === 0) return "Nuk ka vende të lira";
  if (vende === 1) return "1 vend i lirë";
  return `${vende} vende të lira`;
}
