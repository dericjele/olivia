import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ["mammoth", "unpdf"],
};

export default nextConfig;
