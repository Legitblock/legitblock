/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@legitblock/legitblock-utils'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
