/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static font optimization to prevent Google Fonts fetch errors during build
  output: "standalone",
  // Enable Turbopack for faster builds (updated config for Next.js 15)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Images configuration for better compatibility
  images: {
    domains: ["img.clerk.com"],
  },
};

export default nextConfig;
