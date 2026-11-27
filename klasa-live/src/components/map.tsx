"use client";

import { useState } from "react";
import type { Presence } from "@/lib/presence";
import { Pin } from "./brand";

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2)
  .map((part) => Array.from(part)[0]?.toUpperCase()).join("");

export function mapLink({ latitude, longitude }: NonNullable<Presence["coordinates"]>) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

export function Map({ people, me, selected, onSelect }: {
  people: Presence[]; me: string; selected: string | null; onSelect: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const points = people.flatMap((person) => person.coordinates ? [{ person, point: person.coordinates }] : []);
  const origin = points[0]?.point;
  const projected = points.map(({ person, point }) => {
    const delta = ((point.longitude - origin.longitude + 540) % 360) - 180;
    return { person, x: delta * Math.cos(origin.latitude * Math.PI / 180), y: point.latitude };
  });
  const xs = projected.map(({ x }) => x);
  const ys = projected.map(({ y }) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const span = Math.max(xMax - xMin, yMax - yMin, 0.001);
  const focused = projected.find(({ person }) => person.id === selected);
  const centerX = focused?.x ?? (xMin + xMax) / 2;
  const centerY = focused?.y ?? (yMin + yMax) / 2;

  return <div className="plot" aria-label="Skema e pozicioneve GPS">
    <div className="plot-label"><span className="status-dot" /> Pozicionet GPS</div>
    <div className="compass" aria-hidden="true"><strong>V</strong><span>▲</span></div>
    {projected.length === 0 && <div className="map-empty">
      <span className="empty-pin"><Pin /></span>
      <strong>Asnjë pikë GPS</strong>
      <span>Pikat shfaqen kur dikush ndan GPS-in.</span>
    </div>}
    {projected.map(({ person, x, y }) => {
      const left = 50 + ((x - centerX) / span) * 67 * zoom;
      const top = 50 - ((y - centerY) / span) * 58 * zoom;
      if (left < 5 || left > 95 || top < 8 || top > 92) return null;
      return <button key={person.id} type="button"
        className={`marker${person.id === selected ? " is-selected" : ""}${person.id === me ? " is-me" : ""}`}
        style={{ left: `${left}%`, top: `${top}%` }} onClick={() => onSelect(person.id)}
        aria-label={person.name} aria-pressed={person.id === selected}>{initials(person.name)}</button>;
    })}
    {projected.length > 0 && <div className="zoom">
      <button type="button" aria-label="Zmadho hartën" disabled={zoom >= 4}
        onClick={() => setZoom((value) => value * 2)}>+</button>
      <button type="button" aria-label="Zvogëlo hartën" disabled={zoom <= 1}
        onClick={() => setZoom((value) => value / 2)}>−</button>
      <button type="button" aria-label="Rikthe pamjen e plotë" disabled={zoom === 1 && !focused}
        onClick={() => { setZoom(1); if (focused) onSelect(focused.person.id); }}>↺</button>
    </div>}
  </div>;
}
