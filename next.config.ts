import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb", "mongoose", "bcryptjs", "jsonwebtoken"],
};

export default nextConfig;
