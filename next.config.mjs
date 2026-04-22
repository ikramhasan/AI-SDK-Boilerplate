/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "chartjs-node-canvas",
    "@mermaid-js/mermaid-cli",
    "canvas",
  ],
}

export default nextConfig
