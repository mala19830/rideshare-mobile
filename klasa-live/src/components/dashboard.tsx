"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { EXPIRE_SECONDS, type Presence } from "@/lib/presence";
import { Brand, Pin } from "./brand";
import { initials, Map, mapLink } from "./map";
import { usePresence } from "./use-presence";
import { useSharing } from "./use-sharing";

const demoPeople = [
  { id: "1", name: "Arta Berisha", room: "Salla A2", coordinates: { latitude: 42.6577, longitude: 21.1617, accuracy: 24 } },
  { id: "2", name: "Dion Krasniqi", room: "Laboratori 1", coordinates: { latitude: 42.6574, longitude: 21.163, accuracy: 39 } },
  { id: "3", name: "Era Gashi", room: "Biblioteka", coordinates: null },
];
const demoCoordinates = { latitude: 42.6571, longitude: 21.1621, accuracy: 21 };

export function Dashboard({ user, demo = false }: { user: { id: string; name: string }; demo?: boolean }) {
  const { people, connection, syncedAt, refresh } = usePresence(demo);
  const network = demo ? "online" : connection;
  const [examples, setExamples] = useState<Presence[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [room, setRoom] = useState("");
  const [demoPresence, setDemoPresence] = useState<Presence | null>(null);
  const [demoMessage, setDemoMessage] = useState("");
  useEffect(() => {
    if (demo) setExamples(demoPeople.map((person) => ({ ...person, updatedAt: new Date().toISOString() })));
  }, [demo]);

  const sharing = useSharing(refresh);
  const shown = demo ? (demoPresence ? [...examples, demoPresence] : examples) : people;
  const sharingHere = demo ? Boolean(demoPresence) : sharing.phase === "on";
  const pending = sharing.phase === "starting" || sharing.phase === "stopping";
  const alreadySharing = shown.some((person) => person.id === user.id);
  const focused = shown.find((person) => person.id === selected);
  const gpsCount = shown.filter((person) => person.coordinates).length;
  const connectionLabel = {
    loading: "Po lidhemi",
    online: "Lidhur",
    offline: "Pa internet",
    unavailable: "Shërbimi nuk përgjigjet",
    expired: "Sesioni ka skaduar",
    forbidden: "Qasja nuk lejohet",
  }[network];

  function share(mode: "room" | "gps") {
    if (!demo) {
      sharing.start(mode, room);
      return;
    }
    const label = room.trim() || null;
    if (mode === "room" && !label) {
      setDemoMessage("Shkruaj klasën ose dhomën ku ndodhesh.");
      return;
    }
    setDemoPresence({ ...user, room: label, coordinates: mode === "gps" ? demoCoordinates : null, updatedAt: new Date().toISOString() });
    setSelected(user.id);
    setDemoMessage(mode === "gps" ? "GPS-i i simuluar po ndahet." : "Salla po ndahet në demonstrim.");
  }

  function stop() {
    if (demo) {
      setDemoPresence(null);
      setDemoMessage("Ndarja në demonstrim u ndal.");
    } else {
      void sharing.stop(sharing.phase === "idle");
    }
  }

  async function leave() {
    if ((sharingHere || alreadySharing) && sharing.phase !== "unconfirmed" && !await sharing.stop(true)) return;
    await signOut({ callbackUrl: "/" });
  }

  return <>
    <header className="top">
      <div className="wrap top-inner">
        <Brand />
        <div className="account">
          <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
          <span className="account-name">{user.name}</span>
          {demo ? <a className="quiet" href="/">Mbyll demonstrimin</a>
            : <button type="button" className="quiet" onClick={() => void leave()} disabled={pending}>
              {sharing.phase === "unconfirmed" ? "Dil gjithsesi" : "Dil"}</button>}
        </div>
      </div>
    </header>
    <main className="wrap dashboard">
      {demo && <p className="demo-note">Demonstrim me të dhëna shembull. GPS-i i pajisjes nuk përdoret.</p>}
      <div className="page-heading">
        <div><h1>Ku është klasa?</h1><p>Shih ku janë kolegët që po ndajnë vendndodhjen.</p></div>
        <span className={`connection ${network}`}><span className="status-dot" />
          {demo ? "Demonstrim" : connectionLabel}
        </span>
      </div>
      {network !== "online" && network !== "loading" && <div className="notice connection-notice" role="status">
        {network === "offline" && <p>Vendndodhjet live kërkojnë internet. Paneli rifreskohet kur lidhja rikthehet. <a href="/offline.html">Hap udhëzuesin offline</a>.</p>}
        {network === "unavailable" && <p>Po provojmë të rilidhemi. <button type="button" className="quiet" onClick={refresh}>Rifresko tani</button></p>}
        {network === "expired" && <p><a href="/">Hyr përsëri</a> për të parë grupin.</p>}
        {network === "forbidden" && <p>Kontakto organizatorin për qasje në grup.</p>}
        {syncedAt && (network === "offline" || network === "unavailable") && <small>
          Sinkronizimi i fundit <time dateTime={syncedAt.toISOString()}>{syncedAt.toLocaleTimeString("sq-AL")}</time>
        </small>}
      </div>}
      <section className="panel share-panel" aria-labelledby="share-title">
        <div className="share-title"><span className="share-icon"><Pin /></span>
          <div><h2 id="share-title">Vendndodhja jote</h2>
            <p>{sharingHere || alreadySharing ? "Anëtarët e grupit mund ta shohin vendndodhjen tënde." : "Ndaje sallën ose pozicionin GPS me anëtarët e grupit."}</p></div>
        </div>
        {sharing.phase === "stopping" || sharing.phase === "unconfirmed" ? <div className="share-actions">
          <button className="button danger" type="button" onClick={stop} disabled={network === "offline" || pending}>
            {pending ? "Po e ndalim…" : "Riprovo ndaljen"}</button>
        </div> : sharingHere || alreadySharing || sharing.phase === "starting" ? <div className="share-actions">
          <button className="button danger" type="button" onClick={stop}>{pending ? "Anulo ndarjen" : "Ndalo ndarjen"}</button>
        </div> : <form className="share-actions" onSubmit={(event) => { event.preventDefault(); share("room"); }}>
          <label className="room-field">Klasa / dhoma <input value={room} onChange={(event) => setRoom(event.target.value)}
            placeholder="p.sh. Salla A2" maxLength={60} disabled={pending} /></label>
          <div className="buttons">
            <button className="button primary" type="submit" disabled={pending || network !== "online"}>Ndaj vetëm klasën</button>
            <button className="button secondary" type="button" disabled={pending || network !== "online"} onClick={() => share("gps")}><Pin /> Ndaj GPS-in</button>
          </div>
        </form>}
        <p className="share-note">GPS-i kërkon leje. Ndarja punon në plan të parë dhe pika skadon pas {EXPIRE_SECONDS} sekondash pa përditësim.</p>
        <div role="status">{(demo ? demoMessage : sharing.message) && <p className="notice">{demo ? demoMessage : sharing.message}</p>}</div>
      </section>
      <div className="dashboard-grid">
        <section className="panel map-panel" aria-labelledby="map-title">
          <div className="panel-heading"><div><h2 id="map-title">Harta live</h2><p>Skemë e pozicioneve relative të grupit</p></div>
            <span className="count">{gpsCount} GPS</span></div>
          <Map people={shown} me={user.id} selected={focused?.id ?? null} onSelect={(id) => setSelected(id === selected ? null : id)} />
          <div className="map-footer">
            {focused?.coordinates ? <>
              <span><strong>{focused.name}</strong> · ±{Math.round(focused.coordinates.accuracy)} m</span>
              <a href={mapLink(focused.coordinates)} target="_blank" rel="noreferrer">Hape në OpenStreetMap</a>
            </> : focused ? <span><strong>{focused.name}</strong> · {focused.room}</span>
              : <span>Zgjidh një pikë për të parë saktësinë dhe hartën e rrugëve.</span>}
          </div>
        </section>
        <section className="panel roster" aria-labelledby="roster-title">
          <div className="panel-heading"><div><h2 id="roster-title">Kolegët</h2><p>Po ndajnë tani</p></div><span className="count">{shown.length}</span></div>
          {shown.length === 0 && <div className="roster-empty">
            {network === "loading" ? "Po kërkojmë vendndodhjet…" : network === "online"
              ? "Asnjë vendndodhje për t’u shfaqur." : "Vendndodhjet live nuk janë të disponueshme."}
          </div>}
          <ul>
            {shown.map((person) => <li key={person.id}>
              <button type="button" className="person" aria-pressed={focused?.id === person.id}
                onClick={() => setSelected(focused?.id === person.id ? null : person.id)}>
                <span className={`avatar${person.id === user.id ? " own" : ""}`} aria-hidden="true">{initials(person.name)}</span>
                <span className="person-copy"><strong>{person.name}{person.id === user.id ? " (ti)" : ""}</strong>
                  <small>{person.room ? `${person.room} · shënuar me dorë` : `GPS · ±${Math.round(person.coordinates?.accuracy ?? 0)} m`}</small>
                </span>
                <time dateTime={person.updatedAt} title="Koha e përditësimit">{new Date(person.updatedAt).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}</time>
              </button>
            </li>)}
          </ul>
        </section>
      </div>
    </main>
  </>;
}
