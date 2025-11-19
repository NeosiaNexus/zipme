import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20000mb', // 20GB
    },
  },
};

export default nextConfig;
