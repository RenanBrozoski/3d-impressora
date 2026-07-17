import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Uploads de modelo 3D (STL/OBJ/3MF) e anexos passam pela Server Action
      // via multipart/form-data; o limite padrão do Next.js é 1MB.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
