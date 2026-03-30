import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // TypeScript configuration for builds
  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true, // Pre-existing type errors in admin/legacy pages
  },

  // Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Improve bundle analysis and optimization
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lucide-react',
      'framer-motion',
      'date-fns',
    ],
  },

  // Enable production source maps for better debugging (disable in production if not needed)
  productionBrowserSourceMaps: false,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compression
  compress: true,

  // Configure module transpilation for better compatibility
  transpilePackages: [],

  // Proxy API requests through Next.js so browser code can use one origin.
  // Browser requests to /api-proxy/api/... are forwarded to the backend URL.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helpedge-api.onrender.com';

    return [
      {
        source: '/api-proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
