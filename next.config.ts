import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Todas as capas do catálogo são ficheiros locais em /public/covers,
    // normalizados por `scripts/build-covers.sh` — não há capas remotas a
    // otimizar. Os únicos padrões remotos que restam são de conteúdo que não
    // é do catálogo (fotografias editoriais da secção de públicos).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
