"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXPIRE_SECONDS, UPDATE_MS, type Command, type Coordinates, type Location } from "@/lib/presence";

type Run = { id: string; timer?: number; published: boolean };
type Mode = "gps" | "room";
type StopCommand = Extract<Command, { action: "stop" }>;

class PresenceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

class LocationPermissionError extends Error {}

export async function sendCommand(command: Command, keepalive = false) {
  const response = await fetch("/api/presence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
    keepalive,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new PresenceError(response.status, data?.error ?? "Kërkesa dështoi.");
  }
}

function readCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Kjo pajisje nuk ofron GPS. Mund të shënosh klasën me dorë."));
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude, accuracy } = coords;
      resolve({ latitude, longitude, accuracy });
    }, (error) => {
      reject(error.code === error.PERMISSION_DENIED
        ? new LocationPermissionError("Leja për GPS u refuzua. Mund të shënosh klasën me dorë.")
        : new Error("Telefoni nuk dha një pozicion GPS. Mund të shënosh klasën me dorë."));
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 8_000 });
  });
}

export function useSharing(refresh: () => void) {
  const active = useRef<Run | null>(null);
  const stopping = useRef(false);
  const pendingStop = useRef<StopCommand | null>(null);
  const [phase, setPhase] = useState<"idle" | "starting" | "on" | "stopping" | "unconfirmed">("idle");
  const [message, setMessage] = useState("");

  const stop = useCallback(async (global = false, hidden = false, reason?: string) => {
    const run = active.current;
    if (stopping.current) return false;
    if (!run && !pendingStop.current && !global) return true;
    active.current = null;
    window.clearTimeout(run?.timer);
    if (run && !run.published && !global) {
      setPhase("idle");
      setMessage(reason ?? "Ndarja u anulua.");
      return true;
    }
    const command: StopCommand = pendingStop.current ?? { action: "stop", sharingId: run?.id ?? null };
    stopping.current = true;
    pendingStop.current = command;
    setPhase("stopping");
    setMessage("Po presim konfirmimin e serverit…");
    try {
      await sendCommand(command, hidden);
      pendingStop.current = null;
      setPhase("idle");
      setMessage(reason ?? "Ndarja u ndal.");
      return true;
    } catch {
      setPhase("unconfirmed");
      setMessage(`Serveri ende s’e ka konfirmuar ndaljen. Pika skadon pas ${EXPIRE_SECONDS} sekondash pa përditësim.`);
      return false;
    } finally {
      stopping.current = false;
      if (!hidden) refresh();
    }
  }, [refresh]);

  useEffect(() => {
    const onPageHide = () => {
      if (active.current) void stop(false, true, "Ndarja u ndal kur faqja kaloi në sfond.");
    };
    const onOnline = () => {
      if (pendingStop.current && !document.hidden) void stop();
    };
    const onOffline = () => {
      if (active.current) void stop(false, false, "Ndarja u ndal kur lidhja u ndërpre.");
    };
    const onVisibility = () => {
      if (document.hidden) onPageHide();
      else onOnline();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (active.current) void stop(false, true);
    };
  }, [stop]);

  function start(mode: Mode, roomText: string) {
    if (active.current || stopping.current || pendingStop.current || document.hidden || !navigator.onLine) return;
    const room = roomText.trim() || null;
    if (mode === "room" && !room) {
      setMessage("Shkruaj klasën ose dhomën ku ndodhesh.");
      return;
    }
    if (!window.isSecureContext) {
      setMessage("Hape aplikacionin me HTTPS ose localhost për të ndarë vendndodhjen.");
      return;
    }
    const run: Run = { id: crypto.randomUUID(), published: false };
    active.current = run;
    setPhase("starting");
    setMessage(mode === "gps" ? "Po marrim pozicionin GPS…" : "Po ndajmë klasën…");
    let lastSaved = 0;

    async function publish(action: "start" | "update") {
      try {
        const location: Location = { room, coordinates: mode === "gps" ? await readCoordinates() : null };
        if (active.current !== run || document.hidden) return;
        run.published = true;
        await sendCommand({ action, sharingId: run.id, ...location });
        if (active.current !== run) return;
        lastSaved = Date.now();
        setPhase("on");
        setMessage(action === "start" ? (mode === "gps" ? "GPS-i po ndahet me grupin." : "Salla po ndahet me grupin.") : "");
        if (action === "start") refresh();
      } catch (error) {
        if (active.current !== run) return;
        const message = error instanceof Error && !["AbortError", "TimeoutError", "TypeError"].includes(error.name)
          ? error.message : "Lidhja dështoi. Provo sërish.";
        const invalid = error instanceof PresenceError && [401, 403, 409].includes(error.status);
        if (action === "start" || invalid || error instanceof LocationPermissionError || Date.now() - lastSaved >= EXPIRE_SECONDS * 1_000) {
          if (run.published) await stop(false, false, message);
          else {
            active.current = null;
            setPhase("idle");
            setMessage(message);
          }
          return;
        }
        setMessage(message);
      }
      if (active.current === run) run.timer = window.setTimeout(() => void publish("update"), UPDATE_MS);
    }

    void publish("start");
  }

  return { phase, message, start, stop };
}
