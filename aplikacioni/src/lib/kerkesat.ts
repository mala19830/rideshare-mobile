import "server-only";
import { getSql } from "./db";

export type RideRequest = { id: string; ride_id: string; passenger_id?: string; status: "pending" | "accepted" };
export type RideState = {
  ride: { id: string; nisja: string; vende: number };
  role: "driver" | "passenger";
  requests: RideRequest[];
};

export async function lexogjendjen(id: string, githubId: string): Promise<RideState | null> {
  const sql = getSql();
  const rides = await sql`SELECT id, nisja, vende, shofer_id FROM udhetimet WHERE id = ${id}`;
  const ride = rides[0];
  if (!ride) return null;
  const driver = ride.shofer_id === githubId;
  const profiles = await sql`SELECT roli FROM profilet WHERE github_id = ${githubId}`;
  if (driver && profiles[0]?.roli !== "shofer") return null;
  const role = driver ? "driver" : "passenger";
  const requests = driver
    ? await sql`SELECT id::text, ride_id, passenger_id, status FROM kerkesa_udhetimi WHERE ride_id = ${id} ORDER BY id`
    : await sql`SELECT id::text, ride_id, status FROM kerkesa_udhetimi WHERE ride_id = ${id} AND passenger_id = ${githubId}`;
  return {
    ride: { id: String(ride.id), nisja: String(ride.nisja), vende: Number(ride.vende) },
    role,
    requests: requests as RideRequest[],
  };
}

export async function krijoKerkesen(id: string, githubId: string) {
  const sql = getSql();
  const rides = await sql`SELECT vende, shofer_id FROM udhetimet WHERE id = ${id}`;
  if (!rides[0]) return { error: "not_found" as const };
  if (rides[0].shofer_id === githubId) return { error: "forbidden" as const };
  if (Number(rides[0].vende) < 1) return { error: "no_seats" as const };
  const rows = await sql`
    INSERT INTO kerkesa_udhetimi (ride_id, passenger_id)
    VALUES (${id}, ${githubId})
    ON CONFLICT (ride_id, passenger_id) DO UPDATE SET passenger_id = EXCLUDED.passenger_id
    RETURNING id::text, ride_id, status
  `;
  return { request: rows[0] as RideRequest, seats: Number(rides[0].vende) };
}

export async function pranoKerkesen(requestId: number, githubId: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM prano_kerkesen(${requestId}, ${githubId})`;
  return rows[0] as { request_id: string; request_status: string | null; seats_left: number | null; outcome: string } | undefined;
}
