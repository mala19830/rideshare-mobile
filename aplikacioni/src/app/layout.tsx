import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { NderruesiTemes } from "@/components/NderruesiTemes";
import Pwa from "@/components/Pwa";
import { ShiritiLlogarise } from "@/components/ShiritiLlogarise";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RideShare AAB",
  description: "Udhëtime të përbashkëta për në AAB",
};

// Vendos temën para se të vizatohet faqja: zgjedhja e ruajtur, përndryshe ajo e sistemit.
const skriptiTemes = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sq"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skriptiTemes }} />
      </head>
      <body>
        <header className="top-bar">
          <Link className="brand" href="/">
            RideShare
          </Link>
          <div className="top-actions">
            <ShiritiLlogarise />
            <NderruesiTemes />
          </div>
        </header>
        <Pwa />
        {children}
      </body>
    </html>
  );
}
