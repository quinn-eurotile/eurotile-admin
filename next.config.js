// next.config.js

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost','eurotiles-admin.myfileshosting.com', 'myfileshosting.com'],
  },
};

module.exports = nextConfig;
