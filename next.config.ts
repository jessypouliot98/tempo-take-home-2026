import type { NextConfig } from "next";

const rawBasePath = process.env.BASE_PATH?.trim();
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.startsWith("/")
      ? rawBasePath
      : `/${rawBasePath}`
    : undefined;

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  ...(process.env.GITHUB_PAGES === "true" && basePath ? { basePath } : {}),
};

export default nextConfig;
