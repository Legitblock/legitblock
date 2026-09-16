const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@legitblock/legitblock-utils'],
  images: {
    unoptimized: true
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {})
};

export default nextConfig;
