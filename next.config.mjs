/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
        pathname: '/th/id/**',
      },
      {
        protocol: 'https',
        hostname: 'files.oaiusercontent.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Use import.meta.url to resolve __dirname in ES modules
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(currentDir, 'src'),
    };
    return config;
  },
};

export default nextConfig;
