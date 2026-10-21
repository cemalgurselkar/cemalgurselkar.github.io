import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  distDir: "out",
  experimental: {
    useTypeScriptCli: false,
    workerThreads: true,
  },
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
