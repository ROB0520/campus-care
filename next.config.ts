import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    nodeMiddleware: true,
  },
};

export default nextConfig;
