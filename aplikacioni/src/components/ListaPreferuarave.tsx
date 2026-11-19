"use client";

import { useState } from "react";
import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import type { Udhetim } from "@/lib/udhetimet";

export function ListaPreferuarave({ udhetimet }: { udhetimet: Udhetim[] }) {
  const [lista, setLista] = useState(udhetimet);
  const [nePritje, setNePritje] = useState(() => new Set<string>());
  const [mesazhi, setMesazhi] = useState("");

  async function hiqe(id: string) {
    if (nePritje.has(id)) return;
    setNePritje((aktuale) => new Set(aktuale).add(id));
    setMesazhi("");
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(id)}/preferuar`, { method: "DELETE" });
      if (!response.ok) throw new Error("Heqja dështoi");
      setLista((aktuale) => aktuale.filter((udhetim) => udhetim.id !== id));
      setMesazhi("U hoq nga të preferuarat.");
    } catch {
      setMesazhi("Nuk u hoq. Provo përsëri.");
    } finally {
      setNePritje((aktuale) => { const tjetra = new Set(aktuale); tjetra.delete(id); return tjetra; });
    }
  }

  return <>
    {mesazhi && <p role="status" aria-live="polite">{mesazhi}</p>}
    {lista.length === 0 ? <p>Nuk ke më udhëtime të ruajtura si favorite.</p> :
      <div className="trip-list">
        {lista.map((udhetim) => <KartaUdhetimi key={udhetim.id} udhetim={udhetim}>
          <button className="action secondary" type="button" disabled={nePritje.has(udhetim.id)}
            onClick={() => void hiqe(udhetim.id)}>
            {nePritje.has(udhetim.id) ? "Po hiqet…" : "Hiqe nga favoritët"}
          </button>
        </KartaUdhetimi>)}
      </div>}
  </>;
}
