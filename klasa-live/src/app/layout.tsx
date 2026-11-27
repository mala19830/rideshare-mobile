import type { Metadata, Viewport } from "next";
import { OfflineSupport } from "@/components/offline-support";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klasa Live",
  description: "Ndaje vendndodhjen me grupin tënd dhe shih ku janë kolegët.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Klasa Live", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#11111a" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sq"><body>{children}<OfflineSupport /></body></html>;
}
