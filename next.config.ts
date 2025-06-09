import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
    // override webpack để tắt source-map khi chạy dev
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      // Tắt hẳn source-map
      config.devtool = false;
      // Nếu bạn chỉ muốn hạ cấp chứ không tắt hoàn toàn, dùng:
      // config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
