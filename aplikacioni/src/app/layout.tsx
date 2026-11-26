import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Njoftimet } from "@/components/Njoftimet";
import { Pwa } from "@/components/Pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideShare",
  description: "Udhëtime të përbashkëta për studentët",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="sq" className="dark" style={{ colorScheme: "dark" }}>
      <body><Pwa />{session?.user.githubId && <Njoftimet />}{children}</body>
    </html>
  );
}
