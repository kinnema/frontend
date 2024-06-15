import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kinnema",
    short_name: "Kinnema",
    description: "An example of how to use Serwist in Next.js",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff",
    theme_color: "#dc2626",
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
