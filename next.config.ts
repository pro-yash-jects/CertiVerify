import type { NextConfig } from "next";
import path from "node:path";

// ❌ DELETE these lines as they cause the error
// const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');
// // ...
// // Orchids restart: 1758793368176

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  
  // ❌ DELETE this entire 'turbopack' block
  // turbopack: {
  //   rules: {
  //     "*.{jsx,tsx}": {
  //       loaders: [LOADER]
  //     }
  //   }
  // }
};

export default nextConfig;