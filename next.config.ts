import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5000mb", // 5GB
    },
  },
};

export default nextConfig;
