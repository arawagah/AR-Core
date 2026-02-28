/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Allow large MediaPipe model files
  experimental: {
    serverComponentsExternalPackages: ['canvas', '@prisma/client'],
  },

  // Headers for cross-origin isolation needed for SharedArrayBuffer (MediaPipe GPU)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/models/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },

  images: {
    // Allow local images from /public directory
    unoptimized: false,
    remotePatterns: [],
  },

  webpack: (config) => {
    // Suppress warnings for optional canvas dependency
    config.externals = config.externals || [];
    config.externals.push({ canvas: 'canvas' });
    return config;
  },
};

export default nextConfig;
