import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
  },
  api: {
    bodyParser: {
      sizeLimit: "1mb", // จำกัดขนาด JSON ที่ส่งเข้า API
    },
    externalResolver: true, // ป้องกัน Warning API
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,POST,DELETE" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Content-Type, Accept" },
        ],
      },
    ];
  },
};

export default nextConfig;
