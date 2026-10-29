"use client";
import { signIn, signOut } from "next-auth/react";

export default function Hyrja({
  brenda,
  prapa = "/panel",
}: {
  brenda: boolean;
  prapa?: string;
}) {
  return brenda ? (
    <button className="action secondary" onClick={() => signOut({ callbackUrl: "/panel" })}>
      Dil
    </button>
  ) : (
    <button className="action" onClick={() => signIn("github", { callbackUrl: prapa })}>
      Hyr me GitHub
    </button>
  );
}
