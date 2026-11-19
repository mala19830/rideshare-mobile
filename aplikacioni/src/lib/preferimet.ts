import "server-only";
import { getSql } from "./db";
import { profiliIm } from "./lejet";

export async function lexoIdPreferimesh(githubId: string): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`SELECT udhetim_id FROM preferimet WHERE github_id = ${githubId}`;
  return rows.map((row) => row.udhetim_id as string);
}

export async function aEKaPreferuar(
  udhetimId: string
): Promise<boolean> {
  const profili = await profiliIm();

  if (!profili) return false;

  const sql = getSql();
  const rows = await sql`
    SELECT 1
    FROM preferimet
    WHERE github_id = ${profili.id}
      AND udhetim_id = ${udhetimId}
    LIMIT 1
  `;

  return rows.length === 1;
}

export async function ruajPreferim(
  udhetimId: string
): Promise<"hyr" | "ruajtur" | "gabim"> {
  const profili = await profiliIm();

  if (!profili) return "hyr";

  const sql = getSql();

  const rows = await sql`
    INSERT INTO preferimet (github_id, udhetim_id)
    SELECT ${profili.id}, id FROM udhetimet WHERE id = ${udhetimId}
    ON CONFLICT (github_id, udhetim_id) DO UPDATE SET udhetim_id = EXCLUDED.udhetim_id
    RETURNING udhetim_id
  `;

  return rows.length === 1 ? "ruajtur" : "gabim";
}
