"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Njoftim } from "@/lib/njoftimet";

export function Njoftimet() {
  const router = useRouter();
  const [items, setItems] = useState<Njoftim[]>([]);
  const [message, setMessage] = useState("");
  const knownIds = useRef<Set<string> | null>(null);
  const toastedIds = useRef(new Set<string>());
  const [toast, setToast] = useState<Njoftim | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let reading = false;
    const read = async () => {
      if (!active || reading || !navigator.onLine) return;
      reading = true;
      try {
        const response = await fetch("/api/njoftimet", { cache: "no-store" });
        if (!response.ok) throw new Error("read_failed");
        const data = await response.json() as { notifications: Njoftim[] };
        if (!active) return;
        const next = data.notifications;
        if (knownIds.current) {
          const fresh = next.find((item) => !knownIds.current?.has(item.id) && !toastedIds.current.has(item.id));
          if (fresh) {
            toastedIds.current.add(fresh.id);
            setToast(fresh);
          }
        }
        knownIds.current = new Set(next.map((item) => item.id));
        setItems(next);
        setMessage("");
      } catch {
        if (active) setMessage("Njoftimet nuk u lexuan. Po provojmë përsëri.");
      } finally {
        reading = false;
      }
    };
    void read();
    const timer = window.setInterval(() => void read(), 5000);
    const online = () => void read();
    window.addEventListener("online", online);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("online", online);
    };
  }, []);

  async function open(item: Njoftim) {
    if (opening) return;
    setOpening(item.id);
    setMessage("");
    try {
      const response = await fetch(`/api/njoftimet/${encodeURIComponent(item.id)}`, { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("mark_read_failed");
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
      router.push(`/udhetimi/${encodeURIComponent(item.ride_id)}/kerkesa?request=${encodeURIComponent(item.request_id)}`);
    } catch {
      setMessage("Nuk u konfirmua leximi; njoftimi mbetet i palexuar. Provo sërish.");
      setOpening(null);
    }
  }

  const unread = items.filter((item) => item.read_at === null).length;
  if (!items.length && !message) return null;
  return <section aria-label="Njoftimet e mia" className="trip-card">
    <h2>Njoftimet · {unread} të palexuara</h2>
    {toast && <p role="status">Njoftim i ri: shoferi e pranoi kërkesën #{toast.request_id}. <button type="button" onClick={() => setToast(null)}>Mbyll</button></p>}
    {message && <p role="alert">{message}</p>}
    {items.map((item) => <div key={item.id}>
      <p><strong>{item.read_at ? "I lexuar" : "I palexuar"}</strong> · Shoferi e pranoi kërkesën #{item.request_id} · udhëtimi {item.ride_id}</p>
      <button className="action" type="button" disabled={opening !== null} onClick={() => void open(item)}>
        {opening === item.id ? "Po ruhet leximi..." : "Hap kërkesën"}
      </button>
    </div>)}
  </section>;
}
