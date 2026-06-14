import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Privacy Pools SDK bundles snarkjs and other ESM that needs transpiling.
  transpilePackages: ["@0xbow/privacy-pools-core-sdk"],
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
