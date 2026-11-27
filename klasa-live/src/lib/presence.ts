export const POLL_MS = 5_000;
export const UPDATE_MS = 10_000;
export const EXPIRE_SECONDS = 45;

export type Coordinates = { latitude: number; longitude: number; accuracy: number };
export type Location = { room: string | null; coordinates: Coordinates | null };
export type Presence = Location & { id: string; name: string; updatedAt: string };

export type Command =
  | { action: "stop"; sharingId: string | null }
  | ({ action: "start" | "update"; sharingId: string } & Location);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function within(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function parseCommand(value: unknown): Command | null {
  if (!record(value)) return null;
  const { action, sharingId } = value;
  if (sharingId === null && action === "stop") return { action, sharingId };
  if (typeof sharingId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sharingId)) return null;
  if (action === "stop") return { action, sharingId };
  if (action !== "start" && action !== "update") return null;

  if (value.room !== undefined && value.room !== null && typeof value.room !== "string") return null;
  const room = value.room?.trim() ?? null;
  if (room && (room.length > 60 || /[\u0000-\u001f\u007f]/.test(room))) return null;
  let coordinates: Coordinates | null = null;
  if (value.coordinates !== null) {
    if (!record(value.coordinates)) return null;
    const { latitude, longitude, accuracy } = value.coordinates;
    if (!within(latitude, -90, 90) || !within(longitude, -180, 180) || !within(accuracy, 0, 40_000_000)) return null;
    coordinates = { latitude, longitude, accuracy };
  }
  if (!room && !coordinates) return null;
  return { action, sharingId, room: room || null, coordinates };
}
