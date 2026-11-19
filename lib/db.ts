import "server-only";
import { neon } from "@neondatabase/serverless";

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Mungon DATABASE_URL. Vendose në .env.local dhe rinise Next.js.");
  }

  return neon(databaseUrl);
}
