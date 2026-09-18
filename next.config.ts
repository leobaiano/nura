import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nura", 
  assetPrefix: "/nura",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;