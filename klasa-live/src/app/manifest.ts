import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klasa Live",
    short_name: "Klasa Live",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#11111a",
    theme_color: "#11111a",
    lang: "sq",
    icons: [
      { src: "/icons/klasa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/klasa-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
