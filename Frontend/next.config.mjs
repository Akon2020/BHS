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
  },
};

export default nextConfig;
