import "server-only";

import { getSql } from "./db";

export { getSql } from "./db";

export type Trip = {
  id: string;
  nisja: string;
  destinacioni: string;
  ora: string;
  vendtakimi: string;
  vende: number;
};

export async function lexoUdhetimet(): Promise<Trip[]> {
  const sql = getSql();
  const trips = await sql`
    SELECT id, nisja, destinacioni, ora, vendtakimi, vende
    FROM udhetimet
    ORDER BY id
  `;

  return trips as Trip[];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const sql = getSql();
  const trips = await sql`
    SELECT id, nisja, destinacioni, ora, vendtakimi, vende
    FROM udhetimet
    WHERE id = ${id}
    LIMIT 1
  `;

  return (trips[0] as Trip | undefined) ?? null;
}
