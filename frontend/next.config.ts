import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  async redirects() {
    return [
      {
        source: "/documents",
        destination: "/app/documents",
        permanent: true,
      },
      {
        source: "/schemas",
        destination: "/app/schemas",
        permanent: true,
      },
      {
        source: "/extract",
        destination: "/app/extract",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
