import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      // Links shared before /c/ existed; the query string is passed through to /legacy
      {
        source: "/",
        has: [{ type: "query", key: "s" }],
        destination: "/legacy",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
