/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg"],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_DEEPGRAM_API_KEY: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
  },
}

module.exports = nextConfig
