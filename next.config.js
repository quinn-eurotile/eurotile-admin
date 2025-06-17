// next.config.js

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'localhost:3001','eurotiles-admin.myfileshosting.com', 'eurotiles-be.myfileshosting.com', 'myfileshosting.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb'
    }
  }
};

module.exports = nextConfig;
