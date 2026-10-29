import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RideShare AAB", short_name: "RideShare",
    description: "Udhëtime drejt AAB; listë publike për lexim offline.",
    start_url: "/", scope: "/", display: "standalone",
    // Ngjyrat e globals.css: --background (e çelët) dhe --accent.
    background_color: "#fafafa", theme_color: "#0f0f10",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
