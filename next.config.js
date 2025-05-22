// next.config.js

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost','myfileshosting.com'],
  },
};

module.exports = nextConfig;
