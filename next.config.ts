import NextBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

// Initialize the bundle analyzer with its options
const bundleAnalyzerEnabled = NextBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});const nextConfig: NextConfig = {
	output: 'standalone',
	poweredByHeader: false,
	reactStrictMode: true,
	turbopack: {
		resolveAlias: {
			underscore: 'lodash',
		},
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		unoptimized: true,

		formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      },
       {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
    ],
  },
  experimental: {
		webpackBuildWorker: true,
		parallelServerBuildTraces: true,
		parallelServerCompiles: true,
		serverActions: {
			bodySizeLimit: '15mb',
		},
		nodeMiddleware: true,
		authInterrupts: true,
	},
	env: {
		NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV || 'development',
	},
	webpack: (config) => {
		config.resolve.fallback = { fs: false };
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});
		return config;
	},
};

export default bundleAnalyzerEnabled(nextConfig);
