import "server-only";
import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Databaza nuk është konfiguruar.");
  return neon(url);
}

export function raportoGabiminNeon(veprimi: string, gabimi: unknown) {
  const lloji = gabimi instanceof Error ? gabimi.name : "Gabim i panjohur";
  console.error(`Gabim në databazë gjatë veprimit ${veprimi}.`, lloji);
  return "Nuk u lidhëm me databazën. Provo përsëri.";
}
