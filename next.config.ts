import type { NextConfig } from 'next';
const nextConfig: NextConfig = { async rewrites() { return [{ source: '/gv/:slug', destination: '/app.html' }]; } };
export default nextConfig;
