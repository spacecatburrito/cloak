import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: serve under a sub-path and/or emit a self-contained server bundle.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // The Privacy Pools SDK bundles snarkjs and other ESM that needs transpiling.
  transpilePackages: [
    "@0xbow/privacy-pools-core-sdk",
    "@0xbow-io/privacy-pools-v2-sdk",
  ],
  webpack: (config) => {
    // snarkjs / sdk reference node built-ins that don't exist in the browser.
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      readline: false,
      path: false,
      crypto: false,
      // Optional deps pulled by @metamask/sdk that don't exist in a web build.
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
