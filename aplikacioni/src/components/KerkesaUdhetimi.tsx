"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RideState } from "@/lib/kerkesat";

export function KerkesaUdhetimi({ id, initialState }: { id: string; initialState: RideState }) {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [message, setMessage] = useState("");
  const requestActive = useRef(false);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const mutationActive = useRef(false);

  const readState = useCallback(async (signal?: AbortSignal) => {
    if (requestActive.current || mutationActive.current) return;
    requestActive.current = true;
    const currentGeneration = generation.current;
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(id)}/kerkesa`, {
        cache: "no-store", signal,
      });
      if (!response.ok) throw new Error("read_failed");
      const next = await response.json() as RideState;
      if (generation.current === currentGeneration) {
        setState(next);
        setOnline(true);
        setReconnecting(false);
        setMessage("Gjendja u lexua nga serveri");
      }
    } catch {
      if (!signal?.aborted && generation.current === currentGeneration) {
        setOnline(false);
        setReconnecting(true);
        setMessage("");
      }
    } finally {
      if (controller.current?.signal === signal) requestActive.current = false;
    }
  }, [id]);

  useEffect(() => {
    let disposed = false;
    const poll = async () => {
      if (disposed || requestActive.current) return;
      controller.current = new AbortController();
      await readState(controller.current.signal);
    };
    void poll();
    const timer = window.setInterval(poll, 5000);
    const onlineHandler = () => { void poll(); };
    const offlineHandler = () => { setOnline(false); setReconnecting(true); };
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      controller.current?.abort();
    };
  }, [readState]);

  async function mutate(body: Record<string, unknown>) {
    if (!online || busy || mutationActive.current) return;
    mutationActive.current = true;
    generation.current += 1;
    controller.current?.abort();
    controller.current = null;
    requestActive.current = false;
    setBusy(true);
    setMessage(body.action === "accept" ? "Po ruhet pranimi..." : "Po dërgohet kërkesa...");
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(id)}/kerkesa`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error === "no_seats" ? "Nuk ka vende të lira." : "Veprimi nuk u ruajt. Provo sërish.");
        return;
      }
      if (body.action === "accept") {
        setState((current) => ({
          ...current,
          ride: { ...current.ride, vende: Number(result.seats) },
          requests: current.requests.map((item) => item.id === String(body.requestId)
            ? { ...item, status: "accepted" as const } : item),
        }));
      } else {
        setState((current) => ({
          ...current,
          ride: { ...current.ride, vende: Number(result.seats) },
          requests: [result.request as RideState["requests"][number]],
        }));
      }
      setOnline(true);
      setReconnecting(false);
      setMessage(body.action === "accept" ? "Pranimi u ruajt" : "Kërkesa u dërgua");
    } catch {
      setOnline(false);
      setReconnecting(true);
      setMessage("Veprimi nuk u konfirmua. Po rilidhemi.");
    } finally {
      mutationActive.current = false;
      setBusy(false);
    }
  }

  const ownRequest = state.requests[0];
  return (
    <section className="trip-card" aria-label="Kërkesa për vend">
      <p><strong>Udhëtimi {state.ride.id}</strong> · Nisja: {state.ride.nisja}</p>
      <p>Vende të lira: <strong>{state.ride.vende}</strong></p>
      <p>{state.role === "driver" ? "Kërkesat e udhëtarëve" : "Kërkesa ime"}: {ownRequest ? (ownRequest.status === "accepted" ? "U pranua" : "Në pritje") : (state.role === "driver" ? "Ende pa kërkesë" : "Pa kërkesë")}</p>
      {state.role === "passenger" && !ownRequest && <button className="action" disabled={!online || busy || state.ride.vende < 1} onClick={() => void mutate({ action: "request" })}>{busy ? "Po dërgohet..." : "Kërko një vend"}</button>}
      {state.role === "passenger" && ownRequest?.status === "pending" && <p>{busy ? "Po dërgohet..." : "Kërkesa u dërgua"}</p>}
      {state.role === "passenger" && ownRequest?.status === "accepted" && <p>Vendi u konfirmua</p>}
      {state.role === "driver" && state.requests.map((request) => <div key={request.id}>
        <p>Kërkesa #{request.id}: {request.status === "accepted" ? "U pranua" : "Në pritje"}</p>
        {request.status === "accepted" && <p>Pranimi u ruajt</p>}
        {request.status === "pending" && <button className="action" disabled={!online || busy || state.ride.vende < 1} onClick={() => void mutate({ action: "accept", requestId: request.id })}>{busy ? "Po ruhet..." : "Prano kërkesën"}</button>}
      </div>)}
      {message && <p role="status">{message}</p>}
      {reconnecting && <p role="alert">Po rilidhemi · të dhënat mund të jenë të vjetra</p>}
      {!online && !reconnecting && <p role="status">Po kontrollohet lidhja...</p>}
      {online && <p>Gjendja u lexua nga serveri</p>}
      <p>Përditësim automatik çdo 5 sekonda</p>
    </section>
  );
}
