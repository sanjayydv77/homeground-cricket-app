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
  typescript: {
    ignoreBuildErrors: false,
  },
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default withPWA(nextConfig);
