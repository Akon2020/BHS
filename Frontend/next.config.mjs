/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Hôtes autorisés pour l'optimisation des images distantes (uploads de l'API).
    remotePatterns: [
      { protocol: "https", hostname: "api.burningheartihs.org" },
      { protocol: "https", hostname: "burningheartihs.org" },
      { protocol: "http", hostname: "localhost", port: "5500" },
      { protocol: "http", hostname: "127.0.0.1", port: "5500" },
    ],
    // Next.js 16 refuse par défaut d'optimiser une image servie par une IP
    // privée (ex. l'API locale `localhost:5500`) : les images apparaissent
    // cassées. Autorisé en développement uniquement ; en production l'API est
    // servie par `api.burningheartihs.org` (IP publique).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
