/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly expose env vars at build + runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL:     process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Allow images from any domain (for warehouse logos)
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  // Suppress specific build warnings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
