import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Enable PWA in development for testing
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  trailingSlash: true,
};

export default withPWA(nextConfig);
