import "server-only";
import { getSql } from "./db";

export type Njoftim = {
  id: string;
  request_id: string;
  ride_id: string;
  type: "accepted";
  created_at: string;
  read_at: string | null;
};

export async function lexoNjoftimet(recipientId: string): Promise<Njoftim[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT n.id::text, n.request_id::text, k.ride_id, n.type,
      n.created_at, n.read_at
    FROM njoftimet n
    JOIN kerkesa_udhetimi k ON k.id = n.request_id
    WHERE n.recipient_id = ${recipientId}
    ORDER BY n.created_at DESC, n.id DESC
    LIMIT 50
  `;
  return rows as Njoftim[];
}

export async function shenoNjoftiminLexuar(id: string, recipientId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE njoftimet SET read_at = COALESCE(read_at, now())
    WHERE id = ${id} AND recipient_id = ${recipientId}
    RETURNING id
  `;
  return rows.length > 0;
}
