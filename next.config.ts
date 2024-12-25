import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove the experimental section as appDir is no longer experimental
  // Ensure that Next.js knows to handle both .js and .ts files
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default nextConfig;

