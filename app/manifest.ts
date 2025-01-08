import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kinnema",
    short_name: "Kinnema",
    description: "Film!",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070707",
    theme_color: "#22c55e",
    icons: [
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/icon512_maskable.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/icons/icon512_rounded.png",
        type: "image/png",
      },
    ],
  };
}
