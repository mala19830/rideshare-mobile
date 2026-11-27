import { EXPIRE_SECONDS, type Command, type Presence } from "./presence.ts";

type Sql = (strings: TemplateStringsArray, ...params: (string | number | null)[]) =>
  PromiseLike<Record<string, unknown>[]>;
type Member = { id: string; name: string };

export function presenceStore(sql: Sql) {
  return {
    async list(audience: string[] | { prefix: string }): Promise<Presence[]> {
      const memberIds = Array.isArray(audience) ? audience.join(",") : "";
      const prefix = Array.isArray(audience) ? null : audience.prefix;
      const rows = await sql`
        SELECT github_id, name, room, latitude, longitude, accuracy, updated_at
        FROM klasa_live_presence
        WHERE (github_id = ANY(string_to_array(${memberIds}, ',')) OR starts_with(github_id, ${prefix}))
          AND updated_at > now() - ${EXPIRE_SECONDS}::int * interval '1 second'
        ORDER BY name, github_id`;
      return rows.map((row) => ({
        id: String(row.github_id),
        name: String(row.name),
        room: row.room === null ? null : String(row.room),
        coordinates: row.latitude === null ? null : {
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          accuracy: Number(row.accuracy),
        },
        updatedAt: new Date(row.updated_at as string | Date).toISOString(),
      }));
    },

    async write(member: Member, command: Command) {
      const { id, name } = member;
      const { action, sharingId } = command;
      if (action === "start") {
        await sql`WITH expired AS (
          DELETE FROM klasa_live_presence WHERE updated_at <= now() - ${EXPIRE_SECONDS}::int * interval '1 second'
          RETURNING github_id, sharing_id
        ) INSERT INTO klasa_live_closed_shares (member_id, sharing_id)
          SELECT github_id, sharing_id FROM expired ON CONFLICT DO NOTHING`;
        await sql`DELETE FROM klasa_live_closed_shares WHERE closed_at < now() - interval '10 minutes'`;
      }
      const room = action === "stop" ? null : command.room;
      const coordinates = action === "stop" ? null : command.coordinates;
      const { latitude = null, longitude = null, accuracy = null } = coordinates ?? {};
      if (action !== "update") {
        const rows = await sql`SELECT klasa_live_change_sharing(${id}, ${sharingId}::uuid,
          ${action === "stop" ? 1 : 0}::int = 1, ${name}, ${room}, ${latitude}, ${longitude}, ${accuracy},
          ${EXPIRE_SECONDS}::int) AS ok`;
        return rows[0]?.ok === true;
      }
      const rows = await sql`UPDATE klasa_live_presence SET name = ${name}, room = ${room},
        latitude = ${latitude}, longitude = ${longitude}, accuracy = ${accuracy}, updated_at = now()
        WHERE github_id = ${id} AND sharing_id = ${sharingId}
          AND updated_at > now() - ${EXPIRE_SECONDS}::int * interval '1 second'
        RETURNING github_id`;
      return rows.length === 1;
    },
  };
}
