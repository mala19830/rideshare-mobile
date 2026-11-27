"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { POLL_MS, type Presence } from "@/lib/presence";

type Connection = "loading" | "online" | "offline" | "unavailable" | "expired" | "forbidden";
type Snapshot = { people: Presence[]; connection: Connection; syncedAt: Date | null };

export function usePresence(demo: boolean) {
  const [snapshot, setSnapshot] = useState<Snapshot>({ people: [], connection: "loading", syncedAt: null });
  const wake = useRef<(() => void) | null>(null);
  const refresh = useCallback(() => wake.current?.(), []);

  useEffect(() => {
    if (demo) return;
    let timer: number | undefined;
    let request: AbortController | null = null;
    let delay = POLL_MS;
    let authorizationFailed = false;

    function pause() {
      window.clearTimeout(timer);
      const pending = request;
      request = null;
      pending?.abort();
    }

    function mark(connection: Connection) {
      setSnapshot((last) => ({ ...last, people: [], connection }));
    }

    async function poll() {
      if (authorizationFailed || document.hidden) return;
      if (!navigator.onLine) {
        mark("offline");
        return;
      }
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 8_000);
      try {
        const response = await fetch("/api/presence", { cache: "no-store", signal: controller.signal });
        if (request !== controller) return;
        if (response.status === 401 || response.status === 403) {
          authorizationFailed = true;
          mark(response.status === 401 ? "expired" : "forbidden");
          return;
        }
        if (!response.ok) throw new Error("Presence request failed");
        const data = await response.json() as { people?: Presence[] };
        if (request !== controller) return;
        if (!Array.isArray(data.people)) throw new Error("Invalid presence response");
        setSnapshot({ people: data.people, connection: "online", syncedAt: new Date() });
        delay = POLL_MS;
      } catch {
        if (request !== controller) return;
        mark(navigator.onLine ? "unavailable" : "offline");
        delay = Math.min(delay * 2, 30_000);
      } finally {
        window.clearTimeout(timeout);
        if (request === controller) {
          request = null;
          if (!authorizationFailed && !document.hidden && navigator.onLine) {
            timer = window.setTimeout(() => void poll(), delay);
          }
        }
      }
    }

    function restart() {
      pause();
      delay = POLL_MS;
      void poll();
    }

    function offline() {
      pause();
      if (!authorizationFailed) mark("offline");
    }

    wake.current = restart;
    restart();
    document.addEventListener("visibilitychange", restart);
    window.addEventListener("online", restart);
    window.addEventListener("offline", offline);
    return () => {
      wake.current = null;
      pause();
      document.removeEventListener("visibilitychange", restart);
      window.removeEventListener("online", restart);
      window.removeEventListener("offline", offline);
    };
  }, [demo]);

  return { ...snapshot, refresh };
}
