import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.mottabrindes.com.br' }
    ]
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;