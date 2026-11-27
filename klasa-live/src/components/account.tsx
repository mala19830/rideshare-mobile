"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function Login({ provider }: { provider: "github" | "vercel" }) {
  return <button type="button" className="button primary" onClick={() => void signIn(provider, { callbackUrl: "/" })}>
    Hyr me {provider === "vercel" ? "Vercel" : "GitHub"}
  </button>;
}

export function Logout() {
  return <button type="button" className="button secondary" onClick={() => void signOut({ callbackUrl: "/" })}>Dil nga llogaria</button>;
}

export function ClassLogin() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await signIn("class-code", {
        name: String(form.get("name") ?? ""),
        code: String(form.get("code") ?? ""),
        callbackUrl: "/",
        redirect: false,
      });
      if (result?.ok && !result.error) window.location.assign("/");
      else setError("Kontrollo emrin dhe kodin e ftesës.");
    } catch {
      setError("Lidhja dështoi. Provo sërish.");
    } finally {
      setPending(false);
    }
  }

  return <form className="join-form" method="post" onSubmit={join}>
    <label className="room-field">Emri yt<input name="name" autoComplete="nickname" maxLength={60} required /></label>
    <label className="room-field">Kodi i ftesës<input name="code" type="password" autoComplete="off" maxLength={128} required /></label>
    <button type="submit" className="button primary" disabled={pending}>{pending ? "Po hyjmë…" : "Hyr në klasë"}</button>
    {error && <p className="notice" role="alert">{error}</p>}
  </form>;
}
