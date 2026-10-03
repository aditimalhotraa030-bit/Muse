import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avhfyofmobrzegzpmhnr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/collections/:path*',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/admin/collections',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/search',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/best-sellers',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/admin/announcements',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
