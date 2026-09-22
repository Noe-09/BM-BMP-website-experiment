import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 88, 92],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
