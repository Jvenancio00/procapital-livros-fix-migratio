import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite preview em sandbox E2B (https://{port}-{sandboxId}.e2b.app) e evita bloqueios de host/origin
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Next 15+ valida allowedDevOrigins para preview proxy (E2B, Workstations, etc.)
  allowedDevOrigins: ["*.e2b.app", "*.amazonaws.com", "*.cloud.workstations.dev", "*.e2b.dev"],
};

export default nextConfig;
