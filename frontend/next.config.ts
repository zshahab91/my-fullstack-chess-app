import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import type { NextConfig } from "next";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `env/.env.${NODE_ENV}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded env from ${envPath}`);
} else {
  console.log(`Env file not found: ${envPath}, falling back to process.env`);
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  env: {
    // expose NEXT_PUBLIC_* values to the client (add more as needed)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
