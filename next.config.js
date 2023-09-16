/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || "http://localhost:3000",
  },
  webpack: (config, {}) => {
    config.resolve.fallback = {
      "@visheratin/web-ai-node": false,
    };
    return config;
  },
};

module.exports = nextConfig;
