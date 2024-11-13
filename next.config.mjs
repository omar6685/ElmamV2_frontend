/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    esmExternals: 'loose',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
