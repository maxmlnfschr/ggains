/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['punycode']
  }
}

module.exports = nextConfig 