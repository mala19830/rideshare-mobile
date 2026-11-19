"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import type { Udhetim } from "@/lib/udhetimet";

export function ListaUdhetimeve({ udhetimet, preferuarat }: {
  udhetimet: Udhetim[]; preferuarat: string[];
}) {
  const [udhetimetAktuale, setUdhetimetAktuale] = useState(udhetimet);
  const [ids, setIds] = useState(() => new Set(preferuarat));
  const idsRef = useRef(new Set(preferuarat));
  const [pending, setPending] = useState(() => new Set<string>());
  const [mesazhi, setMesazhi] = useState("");
  const pendingRef = useRef(new Set<string>());

  useEffect(() => {
    let ndaluar = false;
    let timer: number;
    const rifresko = async () => {
      try {
        const response = await fetch("/api/udhetimet", { cache: "no-store" });
        if (!response.ok) throw new Error("Lista nuk u rifreskua.");
        const data = await response.json() as { trips?: Udhetim[] };
        if (!ndaluar && Array.isArray(data.trips)) setUdhetimetAktuale(data.trips);
      } catch { /* Mbaje listën e fundit kur ka shkëputje të përkohshme. */ }
      if (!ndaluar) timer = window.setTimeout(rifresko, 5000);
    };
    timer = window.setTimeout(rifresko, 5000);
    return () => { ndaluar = true; window.clearTimeout(timer); };
  }, []);

  function caktoStatusin(id: string, saved: boolean) {
    const kishte = idsRef.current.has(id);
    if (kishte === saved) return;
    const next = new Set(idsRef.current);
    if (saved) next.add(id);
    else next.delete(id);
    idsRef.current = next;
    setIds(next);
  }

  async function ndryshoPreferimin(id: string) {
    if (pendingRef.current.has(id)) return;
    const wasSaved = idsRef.current.has(id);
    const saved = !wasSaved;
    pendingRef.current.add(id);
    caktoStatusin(id, saved);
    setPending((value) => new Set(value).add(id));
    setMesazhi(saved ? "Po ruhet preferimi…" : "Po hiqet nga të preferuarat…");
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(id)}/preferuar`, {
        method: saved ? "POST" : "DELETE",
        ...(saved ? { headers: { "Content-Type": "application/json" }, body: "{}" } : {}),
      });
      if (!response.ok) throw new Error("Ndryshimi dështoi");
      setMesazhi(saved ? "U ruajt te të preferuarat." : "U hoq nga të preferuarat.");
    } catch {
      caktoStatusin(id, wasSaved);
      setMesazhi(saved ? "Nuk u ruajt. Provo përsëri." : "Nuk u hoq. Provo përsëri.");
    } finally {
      pendingRef.current.delete(id);
      setPending((value) => { const next = new Set(value); next.delete(id); return next; });
    }
  }

  return <>
    <div className="favorites-toolbar">
      <Link className="action secondary" href="/preferuarat">Udhëtimet e mia favorite ({ids.size})</Link>
    </div>
    {mesazhi && <p role="status">{mesazhi}</p>}
    <div className="trip-list">
      {udhetimetAktuale.map((udhetim) => {
        const saved = ids.has(udhetim.id);
        const waiting = pending.has(udhetim.id);
        return <KartaUdhetimi key={udhetim.id} udhetim={udhetim}>
          <button className="action secondary" type="button" disabled={waiting}
            aria-pressed={saved} onClick={() => void ndryshoPreferimin(udhetim.id)}>
            <span aria-hidden="true">{saved ? "★" : "☆"}</span> {waiting ? (saved ? "Po ruhet…" : "Po hiqet…") : saved ? "Hiqe nga favoritët" : "Ruaj si favorit"}
          </button>
        </KartaUdhetimi>;
      })}
    </div>
  </>;
}
