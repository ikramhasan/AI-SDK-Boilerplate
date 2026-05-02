/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "chartjs-node-canvas",
    "@mermaid-js/mermaid-cli",
    "canvas",
  ],
  async redirects() {
    return [
      {
        source: "/integrations/:path*",
        destination: "/settings/integrations/:path*",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
