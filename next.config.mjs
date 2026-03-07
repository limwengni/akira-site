/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ebgysbqoofuqyqoypnhi.supabase.co',
        port: '',
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;