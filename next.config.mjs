/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
