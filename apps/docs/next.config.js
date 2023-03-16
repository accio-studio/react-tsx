/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    mdxRs: true,
  },
};

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    experimental: {
      mdxRs: true,
    },
  },
});
module.exports = withMDX(nextConfig);
