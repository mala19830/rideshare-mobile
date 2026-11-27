"use client";

import { useEffect } from "react";

export function OfflineSupport() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !window.isSecureContext || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch((error: unknown) => {
      console.warn("Klasa Live: mbështetja offline nuk u aktivizua.", error);
    });
  }, []);
  return null;
}
