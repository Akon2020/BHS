/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE (Lot 2.4) : réactiver l'optimisation d'images en remplaçant
  // `images.unoptimized` par des `remotePatterns` (host API prod + dev),
  // puis tester l'affichage des images distantes (blog, événements).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
