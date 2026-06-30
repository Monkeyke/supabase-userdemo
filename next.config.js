/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aerchufarhyvjyhjrews.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
