/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.knf.vu.lt',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ktu.edu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vdu.lt',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    esmExternals: 'loose',
    instrumentationHook: true,
  },
  output: 'standalone',
  trailingSlash: false,
}

export default nextConfig
