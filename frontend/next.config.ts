import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    '/api/grpc/**': ['./proto/analytics.proto'],
  },
} as NextConfig;

export default nextConfig;