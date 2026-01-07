import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  buildExcludes: [/middleware-manifest\.json$/, /middleware-runtime\.js$/],
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
