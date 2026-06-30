import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Burning Heart – Pèlerins avec le Christ",
    short_name: "Burning Heart",
    description:
      "Apostolat spirituel et médiatique ignatien : blog, événements, ressources et accompagnement spirituel.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B1538",
    lang: "fr",
    icons: [
      {
        src: "/images/logon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/images/logon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
