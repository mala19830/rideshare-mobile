import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { parseCommand } from "../src/lib/presence.ts";
import { presenceStore } from "../src/lib/store.ts";

const first = { id: "11", name: "Arta" };
const second = { id: "22", name: "Dion" };
const sharingId = "1c9d653e-e2fa-4a66-b2c6-51965a149c85";
const newSharingId = "2c9d653e-e2fa-4a66-b2c6-51965a149c85";
const coordinates = { latitude: 42.65, longitude: 21.16, accuracy: 22 };
const start = { action: "start", sharingId, room: "Salla A2", coordinates };
const update = { ...start, action: "update" };
const stop = { action: "stop", sharingId };

test("pranon GPS dhe klasë, kontrollon kufijtë dhe kërkon një burim të pozicionit", () => {
  assert.deepEqual(parseCommand(start), start);
  assert.equal(parseCommand({ ...start, room: " Salla A2 ", coordinates: null }).room, "Salla A2");
  for (const invalid of ["1", null, NaN, 91]) {
    assert.equal(parseCommand({ ...start, coordinates: { ...coordinates, latitude: invalid } }), null);
  }
  assert.equal(parseCommand({ ...start, room: " ", coordinates: null }), null);
  assert.equal(parseCommand({ ...start, room: "a".repeat(61) }), null);
  assert.equal(parseCommand({ ...start, room: 12 }), null);
  assert.equal(parseCommand({ ...start, sharingId: "e pavlefshme" }), null);
});

test("shfaq vetëm anëtarët e grupit dhe mbron ndarjen nga përditësimet e vonuara", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile(new URL("../schema.sql", import.meta.url), "utf8"));
    const store = presenceStore(async (parts, ...params) => {
      const query = parts.map((part, index) => index === 0 ? part : `$${index}${part}`).join("");
      return (await db.query(query, params)).rows;
    });
    assert.equal(await store.write(first, start), true);
    assert.equal(await store.write(second, { ...start, room: "Laboratori", coordinates: null }), true);
    const people = await store.list([first.id, second.id]);
    assert.deepEqual(people.map(({ id, room, coordinates }) => ({ id, room, coordinates })), [
      { id: first.id, room: "Salla A2", coordinates },
      { id: second.id, room: "Laboratori", coordinates: null },
    ]);
    assert.deepEqual((await store.list([first.id])).map(({ id }) => id), [first.id]);
    assert.deepEqual(await store.list([]), []);
    const vercelA = { id: "vercel:team_a:student-one", name: "AAB" };
    const vercelB = { id: "vercel:team_b:student-two", name: "Team B" };
    await store.write(vercelA, start);
    await store.write(vercelB, start);
    assert.deepEqual((await store.list({ prefix: "vercel:team_a:" })).map(({ id }) => id), [vercelA.id]);
    assert.deepEqual((await store.list([first.id])).map(({ id }) => id), [first.id]);
    await store.write(vercelA, stop);
    await store.write(vercelB, stop);

    assert.equal(await store.write(first, { ...update, room: "Salla B1" }), true);
    assert.equal(await store.write(first, start), true);
    assert.equal((await store.list([first.id]))[0].room, "Salla B1");
    await store.write(first, stop);
    assert.equal(await store.write(first, update), false);
    assert.equal(await store.write(first, start), false);
    assert.deepEqual(await store.list([first.id]), []);

    await store.write(first, { ...start, sharingId: newSharingId });
    assert.equal(await store.write(first, update), false);
    await store.write(first, stop);
    assert.equal((await store.list([first.id])).length, 1);

    await db.query("UPDATE klasa_live_presence SET updated_at = now() - interval '50 seconds' WHERE github_id = $1", [first.id]);
    assert.deepEqual(await store.list([first.id]), []);
    assert.equal(await store.write(first, { ...update, sharingId: newSharingId }), false);
    await store.write(second, start);
    assert.equal((await db.query("SELECT github_id FROM klasa_live_presence")).rows.length, 1);
    await store.write(second, { action: "stop", sharingId: null });
    assert.deepEqual(await store.list([second.id]), []);

    await store.write(second, { ...stop, sharingId: newSharingId });
    assert.equal(await store.write(second, { ...start, sharingId: newSharingId }), false);
    assert.deepEqual(await store.list([second.id]), []);
  } finally {
    await db.close();
  }
});

test("përditësimi i skemës ruan praninë ekzistuese dhe mund të ekzekutohet përsëri", async () => {
  const db = new PGlite();
  try {
    const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
    await db.exec(schema.split("CREATE TABLE IF NOT EXISTS klasa_live_closed_shares")[0]);
    await db.query(`INSERT INTO klasa_live_presence (github_id, sharing_id, name, room)
      VALUES ($1, $2, $3, $4)`, [first.id, sharingId, first.name, "Salla A2"]);
    await db.exec(schema);
    await db.exec(schema);
    const { rows } = await db.query("SELECT github_id, room FROM klasa_live_presence");
    assert.deepEqual(rows, [{ github_id: first.id, room: "Salla A2" }]);
  } finally {
    await db.close();
  }
});
