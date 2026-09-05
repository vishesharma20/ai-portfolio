/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mammoth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
